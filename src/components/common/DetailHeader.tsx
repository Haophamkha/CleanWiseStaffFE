import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DetailHeaderProps = {
  title: string;
  onBack: () => void;
  subtitle?: string;
  right?: ReactNode;
};

/** Header tone da cho các màn chi tiết (không nằm trong tab). */
export function DetailHeader({
  title,
  onBack,
  subtitle,
  right,
}: DetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-accent px-5 pb-5 flex-row items-center overflow-hidden"
      style={{
        paddingTop: insets.top + 8,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -70,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: COLORS.surface,
          opacity: 0.22,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -50,
          left: -30,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: COLORS.surface,
          opacity: 0.16,
        }}
      />

      <PressableScale
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        className="w-11 h-11 rounded-full bg-surface items-center justify-center"
        containerStyle={{ marginRight: 12 }}
      >
        <Feather name="chevron-left" size={24} color={COLORS.ink} />
      </PressableScale>

      <View className="flex-1">
        <Text className="text-ink text-xl font-extrabold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-ink text-xs mt-0.5"
            style={{ opacity: 0.75 }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}
