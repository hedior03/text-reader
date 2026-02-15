import { useChat } from "@vercel/ai/react";
import React from "react";
import { Conversation } from "@/components/ai-elements/conversation";
import { Message } from "@/components/ai-elements/message";
import { Reasoning } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";

// Simple fallback PromptInput – a textarea with a send button.
function FallbackPromptInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = React.useState("");
  const handleSend = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  };
  return (
    <div className="mt-4 flex gap-2">
      <textarea
        className="flex-1 rounded-md border p-2"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message…"
      />
      <button
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        onClick={handleSend}
        disabled={!value.trim()}
      >
        Send
      </button>
    </div>
  );
}

export function ChatInterface({ chatId }: { chatId: string }) {
  const { messages, isLoading, error, handleSubmit } = useChat({
    api: "/api/ai/chat",
    id: chatId,
    render: () => (
      <Conversation>
        {messages.map((m) => (
          <React.Fragment key={m.id}>
            <Message role={m.role} content={m.content} />
            {m.role === "assistant" && <Reasoning role="assistant" content={m.content} />}
            {isLoading && m.id === "assistant" && <Shimmer />}
          </React.Fragment>
        ))}
        {error && <div className="text-red-600">Error: {error.message}</div>}
        <FallbackPromptInput onSubmit={handleSubmit} />
      </Conversation>
    ),
  });

  // UI rendered via the `render` option; component itself returns null.
  return null;
}
