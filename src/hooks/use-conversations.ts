import { queryOptions, useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api/conversations";

export const conversationsQueryOptions = () =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });

export function useConversations() {
  return useQuery(conversationsQueryOptions());
}
