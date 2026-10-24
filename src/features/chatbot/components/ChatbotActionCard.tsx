import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import type { ChatbotCard } from "../types/chatbot";

export function ChatbotActionCard({ card, onPress }: { card: ChatbotCard; onPress: () => void }) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button"
      accessibilityLabel={`${tr(card.label)}: ${card.title}`}
      className="bg-primary-soft border border-primary-border rounded-2xl p-3 mt-2">
      <View className="flex-row items-center">
        <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center mr-2.5">
          <Feather name="book-open" size={17} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-bold text-[13px]" numberOfLines={2}>{card.title}</Text>
          <Text className="text-ink-soft text-xs mt-0.5">{tr("Nguồn hướng dẫn · Phiên bản")} {card.version}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-end mt-2">
        <Text className="text-primary-dark text-xs font-bold mr-1.5">{tr(card.label)}</Text>
        <Feather name="arrow-right" size={14} color={COLORS.primaryDark} />
      </View>
    </TouchableOpacity>
  );
}
