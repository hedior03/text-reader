import { nanoid } from "nanoid";

const generateId = () => nanoid(12);

export const generateChatId = () => `chat-${generateId()}`;
export const generateMessageId = () => `msg-${generateId()}`;
