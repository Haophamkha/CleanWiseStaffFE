import { COLORS, TYPE } from "@/constants/theme";
import { Text, View } from "react-native";

export const SCHEDULE_STATUS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    color: COLORS.warningDark,
    bg: COLORS.warningLight,
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: { label: "Đã hủy", color: COLORS.inkSoft, bg: COLORS.accentLight },
  MISSED: { label: "Đã bỏ lỡ", color: COLORS.danger, bg: COLORS.dangerLight },
};

export function StatusBadge({ status }: { status: string }) {
  const badge = SCHEDULE_STATUS[status] ?? SCHEDULE_STATUS.PENDING;
  return (
    <View
      style={{ backgroundColor: badge.bg }}
      className="px-3 py-1 rounded-full"
    >
      <Text style={[TYPE.label, { color: badge.color }]} className="text-xs">
        {badge.label}
      </Text>
    </View>
  );
}
