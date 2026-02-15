import { queryOptions, useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { getConversationMessages } from "@/lib/api/conversations";

export const conversationMessagesQueryOptions = (conversationId: string) =>
  queryOptions({
    queryKey: ["conversation", conversationId, "messages"],
    queryFn: () =>
      getConversationMessages({ data: conversationId }) as Promise<UIMessage[]>,
  });

export function useConversationMessages(chatId?: string) {
  return useQuery({
    ...conversationMessagesQueryOptions(chatId!),
    enabled: !!chatId,
  });
}
