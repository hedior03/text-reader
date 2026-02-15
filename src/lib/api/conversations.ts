import { createServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { message as messageTable } from "@/lib/db/schema";

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
