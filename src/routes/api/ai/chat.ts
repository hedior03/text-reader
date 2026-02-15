import { createGroq } from "@ai-sdk/groq";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, validateUIMessages } from "ai";
import { env } from "@/env/server";

const groqProvider = createGroq({
  apiKey: env.GROQ_API_KEY,
});

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const { messages } = body;

        const validated = await validateUIMessages({ messages });
        const modelMessages = await convertToModelMessages(validated);

        const result = streamText({
          model: groqProvider("openai/gpt-oss-120b"),
          messages: modelMessages,
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
