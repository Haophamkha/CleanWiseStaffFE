import type { ChatbotMessage, DisplayChatbotMessage } from "../types/chatbot";

export const sortById = (list: ChatbotMessage[]) => [...list].sort((a, b) => a.id - b.id);

export function mergePages(a: ChatbotMessage[], b: ChatbotMessage[]) {
  const map = new Map<number, ChatbotMessage>();
  [...a, ...b].forEach((m) => map.set(m.id, m));
  return sortById([...map.values()]);
}

export function prependOlder(older: ChatbotMessage[], current: DisplayChatbotMessage[]) {
  const ids = new Set(current.map((m) => m.id));
  return [...sortById(older).filter((m) => !ids.has(m.id)), ...current];
}
