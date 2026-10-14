import { router } from "expo-router";
import type { ChatbotCard } from "../types/chatbot";

export function useChatbotCardNavigation() {
  const openCard = (card: ChatbotCard) => {
    if (card.type === "help" && card.action === "OPEN_HELP_ARTICLE" && card.article_id > 0) {
      router.push({ pathname: "/help/[id]", params: { id: String(card.article_id) } });
    }
  };
  return { openCard };
}
