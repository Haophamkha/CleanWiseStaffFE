import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  /** Dòng phụ dưới tiêu đề (tùy chọn) */
  subtitle?: string;
  /** Ghi đè hành vi nút quay lại (mặc định: router.back()) */
  onBack?: () => void;
  backDisabled?: boolean;
};

export function SimpleHeader({ title, subtitle, onBack, backDisabled }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-canvas flex-row items-center px-3 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        disabled={backDisabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        className="items-center justify-center"
        style={{ width: 40, height: 44 }}
      >
        <Feather name="chevron-left" size={30} color={COLORS.ink} />
      </TouchableOpacity>
      <View className="flex-1 ml-0.5">
        <Text className="text-ink text-[24px] font-extrabold" numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-ink-soft text-[13px] mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
