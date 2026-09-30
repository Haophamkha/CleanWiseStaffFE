import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { SHADOWS } from "@/constants/theme";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabHeaderProps = {
  title: string;
  subtitle?: string;
  /** Thay thế chuông bằng nội dung khác */
  right?: ReactNode;
  /** Mặc định hiện chuông thông báo */
  showBell?: boolean;
};

export function TabHeader({
  title,
  subtitle,
  right,
  showBell = true,
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-5 pb-4 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-ink text-[28px] font-extrabold"
          style={{ lineHeight: 34 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-ink-soft text-sm mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {right ??
        (showBell ? (
          <View
            className="w-11 h-11 rounded-full bg-surface border border-line items-center justify-center overflow-hidden"
            style={SHADOWS.card}
          >
            <NotificationBellButton />
          </View>
        ) : null)}
    </View>
  );
}
