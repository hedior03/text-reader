import { createServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { asc, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { conversation, message as messageTable } from "@/lib/db/schema";

export const getConversations = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireAuth();

  const conversations = await db.query.conversation.findMany({
    where: eq(conversation.userId, user.id),
    orderBy: [desc(conversation.updatedAt)],
    columns: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return conversations;
});

export const getConversationMessages = createServerFn({ method: "POST" })
  .inputValidator((input: string) => input)
  .handler(async ({ data: conversationId }) => {
    const messages = await db.query.message.findMany({
      where: eq(messageTable.conversationId, conversationId),
      with: { parts: true },
      orderBy: [asc(messageTable.createdAt)],
    });

    return messages.map(
      (msg) =>
        ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: msg.parts.map((p) => JSON.parse(p.content)),
        }) satisfies UIMessage,
    );
  });
