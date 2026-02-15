import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef } from "react";
import { generateChatId } from "@/lib/ai/id";
import { conversationMessagesQueryOptions } from "./use-conversation-messages";

export function useChatSession(chatId?: string, initialMessages: UIMessage[] = []) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const stableId = useMemo(() => chatId ?? generateChatId(), [chatId]);
  const isNewChat = useRef(!chatId);

  const chat = useChat({
    id: stableId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          conversationId: stableId,
          message: messages[messages.length - 1],
        },
      }),
    }),
    onFinish: ({ messages }) => {
      // Seed the cache with the current messages
      queryClient.setQueryData(
        conversationMessagesQueryOptions(stableId).queryKey,
        messages,
      );

      // Redirect to the conversation URL for new chats
      if (isNewChat.current) {
        isNewChat.current = false;
        router.navigate({
          // biome-ignore lint/suspicious/noExplicitAny: TanStack Router route type not yet regenerated
          to: "/app/chat/{-$chatId}" as any,
          // biome-ignore lint/suspicious/noExplicitAny: TanStack Router param type not yet regenerated
          params: { chatId: stableId } as any,
          replace: true,
          resetScroll: false,
        });
      }
    },
  });

  return {
    ...chat,
    conversationId: stableId,
  };
}
