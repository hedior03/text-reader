import { createFileRoute } from "@tanstack/react-router";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useChatSession } from "@/hooks/use-chat-session";

export const Route = createFileRoute("/_auth/app/chat/{-$chatId}")({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { messages, status, sendMessage } = useChatSession(chatId);

  return <ChatInterface messages={messages} sendMessage={sendMessage} status={status} />;
}
