import { createGroq } from "@ai-sdk/groq";
import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { asc, eq } from "drizzle-orm";
import { env } from "@/env/server";
import { generateMessageId } from "@/lib/ai/id";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { conversation, message, part } from "@/lib/db/schema";

const groqProvider = createGroq({
  apiKey: env.GROQ_API_KEY,
});

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { conversationId, message: userMessage } = body as {
          conversationId: string;
          message: UIMessage;
        };

        await db
          .insert(conversation)
          .values({
            id: conversationId,
            userId: session.user.id,
            title: "New Chat",
          })
          .onConflictDoNothing();

        const userMessageId = userMessage.id ?? generateMessageId();
        await db.insert(message).values({
          id: userMessageId,
          conversationId,
          role: userMessage.role,
        });

        if (userMessage.parts) {
          await db.insert(part).values(
            userMessage.parts.map((p, idx) => ({
              id: `${userMessageId}-part-${idx}`,
              messageId: userMessageId,
              conversationId,
              type: p.type,
              content: JSON.stringify(p),
            })),
          );
        }

        const existingMessages = await db.query.message.findMany({
          where: eq(message.conversationId, conversationId),
          with: { parts: true },
          orderBy: [asc(message.createdAt)],
        });

        const uiMessages: UIMessage[] = existingMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: msg.parts.map((p) => JSON.parse(p.content)),
        }));

        const modelMessages = await convertToModelMessages(uiMessages);

        const result = streamText({
          model: groqProvider("openai/gpt-oss-120b"),
          messages: modelMessages,
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            const assistantMessageId = responseMessage.id ?? generateMessageId();

            await db.insert(message).values({
              id: assistantMessageId,
              conversationId,
              role: "assistant",
            });

            if (responseMessage.parts) {
              await db.insert(part).values(
                responseMessage.parts.map((p, idx) => ({
                  id: `${assistantMessageId}-part-${idx}`,
                  messageId: assistantMessageId,
                  conversationId,
                  type: p.type,
                  content: JSON.stringify(p),
                })),
              );
            }
          },
        });
      },
    },
  },
});
