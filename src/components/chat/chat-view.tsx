import type { UIMessage } from "ai";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useChatSession } from "@/hooks/use-chat-session";

export function ChatView({
  chatId,
  initialMessages,
}: {
  chatId?: string;
  initialMessages: UIMessage[];
}) {
  const { messages, status, sendMessage } = useChatSession(chatId, initialMessages);

  return <ChatInterface messages={messages} sendMessage={sendMessage} status={status} />;
}
