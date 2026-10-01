import { COLORS } from "@/constants/theme";
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
    <View className="bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center px-3 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="items-center justify-center"
          style={{ width: 40, height: 44 }}
        >
          <Feather name="chevron-left" size={30} color={COLORS.ink} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-ink text-base font-extrabold"
          style={{ letterSpacing: 0.3 }}
        >
          CleanWise Staff
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View className="h-1.5 bg-accent-light mx-5 rounded-full mb-3 overflow-hidden">
        <View
          className="h-full bg-ink rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
