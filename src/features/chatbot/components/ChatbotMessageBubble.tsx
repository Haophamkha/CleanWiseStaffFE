import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useChatbotReveal } from "../hooks/useChatbotReveal";
import type { ChatbotCard, DisplayChatbotMessage } from "../types/chatbot";
import { formatChatbotText } from "../utils/formatChatbotText";
import { ChatbotActionCard } from "./ChatbotActionCard";

type Props = {
  message: DisplayChatbotMessage;
  animate: boolean;
  onRevealDone: () => void;
  onRetry: () => void;
  onOpenCard: (card: ChatbotCard) => void;
};

export function ChatbotMessageBubble({ message, animate, onRevealDone, onRetry, onOpenCard }: Props) {
  const isUser = message.role === "user";
  const formatted = formatChatbotText(message.text);
  const reveal = useChatbotReveal(formatted, message.cards.length, animate, onRevealDone);

  if (isUser) {
    const failed = message.status === "LOCAL_FAILED";
    return (
      <View className="px-4 py-1.5 items-end">
        <View className="bg-ink rounded-3xl rounded-br-md px-4 py-2.5 max-w-[85%]">
          <Text className="text-white text-[15px] leading-[22px]">{message.text}</Text>
        </View>
        {failed && (
          <TouchableOpacity onPress={onRetry} className="flex-row items-center mt-1" accessibilityRole="button">
            <Feather name="alert-circle" size={13} color={COLORS.danger} />
            <Text className="text-danger text-xs ml-1 font-semibold">Gửi thất bại · Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="px-4 py-1.5 flex-row items-start">
      <View className="w-8 h-8 rounded-xl bg-primary-light items-center justify-center mr-2 mt-0.5">
        <MaterialCommunityIcons name="robot-happy-outline" size={21} color={COLORS.primaryDark} />
      </View>
      <View className="flex-1 max-w-[88%]">
        <View className="bg-surface border border-line rounded-3xl rounded-tl-md px-4 py-2.5">
          <Text className="text-ink text-[15px] leading-[22px]">
            {reveal.text || (message.status === "FAILED" ? "Trợ lý chưa trả lời được. Bạn thử lại sau nhé." : "")}
          </Text>
        </View>
        {message.cards.slice(0, reveal.cardCount).map((card) => (
          <ChatbotActionCard key={`${card.type}:${card.article_id}`} card={card} onPress={() => onOpenCard(card)} />
        ))}
      </View>
    </View>
  );
}
