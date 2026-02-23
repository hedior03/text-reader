import { nanoid } from "nanoid";

const generateId = () => nanoid(16);

export const generateChatId = () => `chat-${generateId()}`;
export const generateMessageId = () => `msg-${generateId()}`;
