import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/chat/chat-view";
import { useConversationMessages } from "@/hooks/use-conversation-messages";

export const Route = createFileRoute("/_auth/app/chat/{-$chatId}")({
  component: ChatPage,
  shouldReload: false,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { data: savedMessages, isPending } = useConversationMessages(chatId);

  if (isPending && chatId) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  return <ChatView chatId={chatId} initialMessages={savedMessages ?? []} />;
}
