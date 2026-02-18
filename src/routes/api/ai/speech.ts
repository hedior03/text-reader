import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { experimental_generateSpeech as generateSpeech } from "ai";
import { env } from "@/env/server";
import { auth } from "@/lib/auth/auth";

const ALLOWED_VOICES = ["coral", "sage"] as const;
type Voice = (typeof ALLOWED_VOICES)[number];

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
          const result = await generateSpeech({
            model: openaiProvider.speech("gpt-4o-mini-tts"),
            text: text.trim(),
            voice,
            instructions: instructions?.trim() || undefined,
          });

          return Response.json({
            audio: {
              base64: result.audio.base64,
              mediaType: result.audio.mediaType,
              format: result.audio.format,
            },
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
