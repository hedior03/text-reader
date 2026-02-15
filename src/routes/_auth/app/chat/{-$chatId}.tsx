import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { ChatInterface } from "@/components/chat/chat-interface";
import { generateChatId } from "@/lib/ai/id";

export const Route = createFileRoute("/_auth/app/chat/{-$chatId}")({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();

  const { messages, status, sendMessage } = useChat({
    id: chatId ?? generateChatId(),
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  });

  return <ChatInterface messages={messages} sendMessage={sendMessage} status={status} />;
}
