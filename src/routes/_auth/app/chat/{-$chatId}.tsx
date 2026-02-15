import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import type { TextUIPart, UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { generateChatId } from "@/lib/ai/id";

export const Route = createFileRoute("/_auth/app/chat/{-$chatId}")({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    id: chatId ?? generateChatId(),
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center">No messages yet</p>
          ) : (
            messages.map((message: UIMessage) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold uppercase">
                    {message.role}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.parts
                      ?.filter((part): part is TextUIPart => part.type === "text")
                      .map((part) => part.text)
                      .join("") || "No content"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="mx-auto flex w-full max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            disabled={status !== "ready"}
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
