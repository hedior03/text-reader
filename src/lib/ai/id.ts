import { nanoid } from "nanoid";

export function generateChatId(): string {
  return nanoid(12);
}

export function generateMessageId(): string {
  return nanoid(12);
}
