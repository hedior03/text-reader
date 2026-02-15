import { useChat } from "@ai-sdk/react";
import { useRouter } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateChatId } from "@/lib/ai/id";

export function useChatSession(chatId?: string) {
  const router = useRouter();
  const [isLoadingMessages, setIsLoadingMessages] = useState(!!chatId);
  const stableId = useMemo(() => chatId ?? generateChatId(), [chatId]);
  const hasSavedRef = useRef(false);

  const chat = useChat({
    id: stableId,
    messages: [],
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
    onFinish: async ({ messages }) => {
      if (!chatId && !hasSavedRef.current) {
        hasSavedRef.current = true;

        router.history.push(`/app/chat/${stableId}`, { replace: true });
      } else if (chatId) {
        await fetch(`/api/conversations/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
      }
    },
  });

  useEffect(() => {
    if (!chatId) {
      setIsLoadingMessages(false);
      return;
    }

    async function loadMessages() {
      try {
        const response = await fetch(`/api/conversations/${chatId}/messages`);
        if (!response.ok) throw new Error("Failed to load messages");

        const messages = await response.json();
        chat.setMessages(messages);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
  }, [chatId, chat.setMessages]);

  return {
    ...chat,
    conversationId: stableId,
    isLoadingMessages,
  };
}
