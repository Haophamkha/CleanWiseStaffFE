export type ChatbotConversation = { id: number; title: string; status: "ACTIVE" | "CLOSED"; created_at: string; updated_at: string };
type CardBase = { title: string; label: string };
export type ChatbotCard = CardBase & { type: "help"; action: "OPEN_HELP_ARTICLE"; article_id: number; version: number; effective_from: string };
export type ChatbotMessage = {
  id: number; role: "user" | "assistant" | "system"; text: string; cards: ChatbotCard[];
  status: "PROCESSING" | "COMPLETED" | "FAILED"; client_message_id: string | null; run_id: string | null; created_at: string;
};
export type DisplayChatbotMessage = Omit<ChatbotMessage, "id" | "status"> & { id: number | string; status: ChatbotMessage["status"] | "LOCAL_FAILED" };
export type HelpArticle = {
  id: number; slug: string; version: number; title: string; summary: string;
  sections: { heading: string; text: string }[]; effective_from: string; source_document: string;
};
export type ChatbotRunDetail = { run: { id: string; status: string }; user_message: ChatbotMessage; assistant_message: ChatbotMessage | null };
export type ChatbotReply = ChatbotRunDetail & { conversation_id: number; replayed: boolean };
export type ChatbotPage<T> = { count: number; next: string | null; previous: string | null; results: T[] };
