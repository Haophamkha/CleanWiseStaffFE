import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

function getLocalizedQuestions(translateText = defaultTranslate) {
  return [
    { icon: "calendar" as const, title: translateText("Lịch làm sắp tới"), text: translateText("Ngày mai tôi có lịch làm việc nào?") },
    { icon: "dollar-sign" as const, title: translateText("Thu nhập của tôi"), text: translateText("Thu nhập tuần này của tôi là bao nhiêu?") },
    { icon: "credit-card" as const, title: translateText("Rút tiền từ ví"), text: translateText("Hướng dẫn tôi cách rút tiền từ ví.") },
    { icon: "mail" as const, title: translateText("Lời mời nhận việc"), text: translateText("Tôi nhận lời mời làm việc từ quản trị viên như thế nào?") },
    { icon: "book-open" as const, title: translateText("Quy định cho nhân viên"), text: translateText("Cho tôi xem quy định khi huỷ buổi đã nhận và xử lý sự cố.") },
  ];
}

export function ChatbotWelcome({ onAsk, disabled }: { onAsk: (t: string) => void; disabled: boolean }) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  return (
    <View className="px-5 py-6">
      <View className="w-16 h-16 rounded-3xl bg-primary-light items-center justify-center mb-4">
        <MaterialCommunityIcons name="robot-happy-outline" size={36} color={COLORS.primaryDark} />
      </View>
      <Text className="text-ink text-[23px] font-extrabold">{tr("Tôi có thể giúp gì cho bạn?")}</Text>
      <Text className="text-ink-soft text-sm leading-6 mt-2 mb-5">
        {tr("Hỏi nhanh về lịch làm, thu nhập, ví, lời mời nhận việc và quy định dành cho nhân viên, có nguồn tham khảo.")}</Text>
      <View style={{ gap: 10 }}>
        {getLocalizedQuestions(tr).map((q) => (
          <TouchableOpacity key={q.title} onPress={() => onAsk(q.text)} disabled={disabled} activeOpacity={0.8}
            accessibilityRole="button" accessibilityLabel={q.title}
            className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3.5">
            <View className="w-9 h-9 rounded-xl bg-primary-soft items-center justify-center mr-3">
              <Feather name={q.icon} size={17} color={COLORS.primaryDark} />
            </View>
            <Text className="flex-1 text-ink font-semibold text-sm">{q.title}</Text>
            <Feather name="arrow-up-right" size={17} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
