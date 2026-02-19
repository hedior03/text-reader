import { createOpenAI, type OpenAITranscriptionModelOptions } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import {
  experimental_generateSpeech as generateSpeech,
  experimental_transcribe as transcribe,
} from "ai";
import { env } from "@/env/server";
import { auth } from "@/lib/auth/auth";

const ALLOWED_VOICES = ["coral", "sage"] as const;
type Voice = (typeof ALLOWED_VOICES)[number];

type WhisperWord = { word: string; start: number; end: number };

const openaiProvider = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const Route = createFileRoute("/api/ai/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { text, voice, instructions } = body as {
          text: string;
          voice: Voice;
          instructions?: string;
        };

        if (!text || typeof text !== "string" || text.trim().length === 0) {
          return Response.json({ error: "Text is required" }, { status: 400 });
        }

        if (text.length > 10_000) {
          return Response.json(
            { error: "Text exceeds maximum length of 10,000 characters" },
            { status: 400 },
          );
        }

        if (!ALLOWED_VOICES.includes(voice)) {
          return Response.json({ error: "Invalid voice selection" }, { status: 400 });
        }

        try {
          const speechResult = await generateSpeech({
            model: openaiProvider.speech("gpt-4o-mini-tts"),
            text: text.trim(),
            voice,
            instructions: instructions?.trim() || undefined,
          });

          // Transcribe the generated audio to get word-level timestamps.
          // The @ai-sdk/openai provider maps `segments ?? words ?? []`, so sentence-level
          // segments always win when verbose_json returns both. Word-level data is in
          // result.responses[0].body — preserved by the provider but omitted from the
          // public TranscriptionModelResponseMetadata type.
          let segments: Array<{ text: string; startSecond: number; endSecond: number }> =
            [];

          try {
            const transcribeResult = await transcribe({
              model: openaiProvider.transcription("whisper-1"),
              audio: speechResult.audio.base64,
              providerOptions: {
                openai: {
                  timestampGranularities: ["word"],
                } satisfies OpenAITranscriptionModelOptions,
              },
            });

            // biome-ignore lint/suspicious/noExplicitAny: raw response body is not publicly typed
            const rawBody = (transcribeResult as any).responses?.[0]?.body as
              | { words?: WhisperWord[] }
              | undefined;

            segments =
              rawBody?.words?.map((w) => ({
                text: w.word,
                startSecond: w.start,
                endSecond: w.end,
              })) ?? transcribeResult.segments;
          } catch (transcribeErr) {
            // Transcription failure is non-fatal — audio still plays without highlighting.
            console.error("[speech] Transcription failed:", transcribeErr);
          }

          return Response.json({
            audio: {
              base64: speechResult.audio.base64,
              mediaType: speechResult.audio.mediaType,
              format: speechResult.audio.format,
            },
            segments,
          });
        } catch (err) {
          console.error("[speech] Generation failed:", err);

          if (err instanceof Error && err.message?.toLowerCase().includes("rate")) {
            return Response.json(
              { error: "Rate limited. Please try again shortly." },
              { status: 429 },
            );
          }

          return Response.json({ error: "Speech generation failed" }, { status: 500 });
        }
      },
    },
  },
});
