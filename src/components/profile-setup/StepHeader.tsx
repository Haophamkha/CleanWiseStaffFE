import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  step: number;
  totalSteps: number;
};

export function StepHeader({ step, totalSteps }: Props) {
  const insets = useSafeAreaInsets();
  const progress = Math.min(step / totalSteps, 1);

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="bg-white border-b border-[#F3F4F6]"
    >
      <View className="flex-row items-center justify-between px-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[#2563EB] text-base font-bold">
          CleanCare Staff
        </Text>
        <View style={{ width: 22 }} />
      </View>
      <View className="h-1.5 bg-[#F3F4F6] mx-4 rounded-full mb-3 overflow-hidden">
        <View
          className="h-full bg-[#2563EB] rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
