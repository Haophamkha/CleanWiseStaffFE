import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-canvas items-center justify-center px-8"
      style={{ paddingTop: insets.top }}
    >
      <View className="w-24 h-24 rounded-full bg-primary-light items-center justify-center mb-6">
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={48}
          color={COLORS.primary}
        />
      </View>
      <Text className="text-ink text-xl font-extrabold text-center">
        Trợ lý CleanWise
      </Text>
      <Text className="text-ink-soft text-center mt-2 leading-5">
        Tính năng đang được phát triển. Bạn sẽ sớm có trợ lý hỗ trợ trả lời
        nhanh về công việc và lịch làm.
      </Text>
    </View>
  );
}
