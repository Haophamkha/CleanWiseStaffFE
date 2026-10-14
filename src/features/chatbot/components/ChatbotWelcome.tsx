import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const QUESTIONS = [
  { icon: "calendar" as const, title: "Lịch làm sắp tới", text: "Ngày mai tôi có lịch làm việc nào?" },
  { icon: "dollar-sign" as const, title: "Thu nhập của tôi", text: "Thu nhập tuần này của tôi là bao nhiêu?" },
  { icon: "credit-card" as const, title: "Rút tiền từ ví", text: "Hướng dẫn tôi cách rút tiền từ ví." },
  { icon: "mail" as const, title: "Lời mời nhận việc", text: "Tôi nhận lời mời làm việc từ quản trị viên như thế nào?" },
  { icon: "book-open" as const, title: "Quy định cho nhân viên", text: "Cho tôi xem quy định khi huỷ buổi đã nhận và xử lý sự cố." },
];

export function ChatbotWelcome({ onAsk, disabled }: { onAsk: (t: string) => void; disabled: boolean }) {
  return (
    <View className="px-5 py-6">
      <View className="w-16 h-16 rounded-3xl bg-primary-light items-center justify-center mb-4">
        <MaterialCommunityIcons name="robot-happy-outline" size={36} color={COLORS.primaryDark} />
      </View>
      <Text className="text-ink text-[23px] font-extrabold">Tôi có thể giúp gì cho bạn?</Text>
      <Text className="text-ink-soft text-sm leading-6 mt-2 mb-5">
        Hỏi nhanh về lịch làm, thu nhập, ví, lời mời nhận việc và quy định dành cho nhân viên, có nguồn tham khảo.
      </Text>
      <View style={{ gap: 10 }}>
        {QUESTIONS.map((q) => (
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
