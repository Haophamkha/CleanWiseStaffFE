import { useTranslation } from "react-i18next";
import { translate as defaultTranslate } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { TYPE } from "@/constants/theme";
import { Text, View } from "react-native";

export function getScheduleStatus(COLORS: ThemeColors, translateText = defaultTranslate): Record<
  string,
  { label: string; color: string; bg: string }
> { return {
  PENDING: {
    label: translateText("Chờ thực hiện"),
    color: COLORS.warningDark,
    bg: COLORS.warningLight,
  },
  IN_PROGRESS: {
    label: translateText("Đang thực hiện"),
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: translateText("Hoàn thành"),
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: { label: translateText("Đã hủy"), color: COLORS.inkSoft, bg: COLORS.accentLight },
  MISSED: { label: translateText("Đã bỏ lỡ"), color: COLORS.danger, bg: COLORS.dangerLight },
}; }

export function StatusBadge({ status }: { status: string }) {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();

  const statuses = getScheduleStatus(COLORS, tr);
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
