import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotificationsHeaderProps = {
  unreadCount: number;
  hasItems: boolean;
  onBack: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
};

export function NotificationsHeader({
  unreadCount,
  hasItems,
  onBack,
  onMarkAllRead,
  onClearAll,
}: NotificationsHeaderProps) {
  const insets = useSafeAreaInsets();
  const canMarkAll = unreadCount > 0;

  return (
    <View
      className="px-4 pb-4 flex-row items-center"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Nút quay lại: chỉ có mũi tên, không viền */}
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        className="items-center justify-center"
        style={{ width: 40, height: 44 }}
      >
        <Feather name="chevron-left" size={30} color={COLORS.ink} />
      </Pressable>

      <Text
        className="flex-1 text-ink text-[26px] font-extrabold ml-0.5"
        style={{ lineHeight: 32 }}
        numberOfLines={1}
      >
        Thông báo
      </Text>

      {/* Đọc tất cả + thùng rác nằm cạnh nhau */}
      <Pressable
        onPress={onMarkAllRead}
        disabled={!canMarkAll}
        accessibilityRole="button"
        accessibilityLabel="Đọc tất cả thông báo"
        className={`flex-row items-center px-3.5 rounded-full mr-2 ${
          canMarkAll ? "bg-ink" : "bg-accent-light"
        }`}
        style={{ height: 40 }}
      >
        <Feather
          name="check-circle"
          size={15}
          color={canMarkAll ? COLORS.white : COLORS.inkMuted}
        />
        <Text
          className={`text-[13px] ml-1.5 ${
            canMarkAll ? "text-white" : "text-ink-muted"
          }`}
          style={{ fontWeight: "800" }}
        >
          Đọc tất cả
        </Text>
      </Pressable>

      <Pressable
        onPress={onClearAll}
        disabled={!hasItems}
        accessibilityRole="button"
        accessibilityLabel="Xoá tất cả thông báo"
        className="w-10 h-10 rounded-full bg-surface border border-line items-center justify-center"
        style={[SHADOWS.card, { opacity: hasItems ? 1 : 0.5 }]}
      >
        <Feather
          name="trash-2"
          size={17}
          color={hasItems ? COLORS.danger : COLORS.inkMuted}
        />
      </Pressable>
    </View>
  );
}
