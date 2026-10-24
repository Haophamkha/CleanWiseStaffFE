import { translate as tr } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { TYPE } from "@/constants/theme";
import { Text, View } from "react-native";

export function getScheduleStatus(COLORS: ThemeColors): Record<
  string,
  { label: string; color: string; bg: string }
> { return {
  PENDING: {
    label: tr("Chờ thực hiện"),
    color: COLORS.warningDark,
    bg: COLORS.warningLight,
  },
  IN_PROGRESS: {
    label: tr("Đang thực hiện"),
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: tr("Hoàn thành"),
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: { label: tr("Đã hủy"), color: COLORS.inkSoft, bg: COLORS.accentLight },
  MISSED: { label: tr("Đã bỏ lỡ"), color: COLORS.danger, bg: COLORS.dangerLight },
}; }

export function StatusBadge({ status }: { status: string }) {
  const { COLORS } = useAppTheme();

  const statuses = getScheduleStatus(COLORS);
  const badge = statuses[status] ?? statuses.PENDING;
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
