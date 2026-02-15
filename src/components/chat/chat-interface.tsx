"use client";

import type { ChatStatus, TextUIPart, UIMessage } from "ai";
import { DownloadIcon, MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatInterfaceProps {
  messages: UIMessage[];
  sendMessage: (message: { text: string }) => void;
  status: ChatStatus;
}

export function ChatInterface({ messages, sendMessage, status }: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message, messageIdx) => {
              const isLastMessage = messageIdx === messages.length - 1;

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts?.map((part, partIdx) => {
                      const isLastPart = partIdx === message.parts!.length - 1;
                      const isStreaming =
                        status === "streaming" && isLastMessage && isLastPart;

                      if (part.type === "reasoning") {
                        return (
                          <Reasoning
                            key={`${message.id}-reasoning-${partIdx}`}
                            isStreaming={isStreaming}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }

                      if (part.type === "text") {
                        const textPart = part as TextUIPart;
                        return (
                          <MessageResponse key={`${message.id}-text-${partIdx}`}>
                            {textPart.text}
                          </MessageResponse>
                        );
                      }

                      return null;
                    })}
                  </MessageContent>
                </Message>
              );
            })
          )}
        </ConversationContent>

        <ConversationScrollButton />

        {/* Download button with "Coming Soon" modal */}
        <Dialog>
          <DialogTrigger
            className="absolute bottom-20 right-4 size-10 rounded-full shadow-lg"
            render={<Button size="icon" variant="outline" />}
          >
            <DownloadIcon className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Conversation</DialogTitle>
              <DialogDescription>
                This feature is under construction. Soon you'll be able to export your
                conversation as a Markdown file.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Conversation>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="mx-auto flex w-full max-w-3xl gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            disabled={status !== "ready"}
          />
          <Button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="self-end"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
