import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PressableScale } from "@/components/ui/PressableScale";
import type { JobActionsState } from "@/features/job/hooks/useJobDetail";
import { useAppTheme } from "@/features/theme/ThemeProvider";

export function CancellationImpact({ actions }: { actions: JobActionsState }) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const preview = actions.cancelPreview;

  if (actions.isCancelPreviewError) {
    return (
      <PressableScale
        accessibilityRole="button"
        onPress={actions.refetchCancelPreview}
        className="flex-row items-center gap-2 bg-danger-light rounded-2xl px-3 py-3 mb-3"
      >
        <Feather name="refresh-cw" size={15} color={COLORS.danger} />
        <Text className="flex-1 text-danger text-sm font-semibold">
          {t("Không tải được điểm dự kiến. Thử lại")}
        </Text>
      </PressableScale>
    );
  }

  let title = t("Đang tính điểm dự kiến...");
  let message: string | undefined;
  if (!actions.isLoadingCancelPreview && preview) {
    if (!preview.can_cancel && !preview.requires_review) {
      title = t("Không thể tự hủy");
    } else {
      title = t("Trừ {{points}} điểm · {{current}}/10 → {{next}}/10", {
        points: preview.deduction,
        current: preview.score,
        next: preview.projected_score,
      });
      if (preview.requires_review) {
        message = t("Chỉ trừ điểm nếu admin xác nhận thuộc trách nhiệm của bạn.");
      } else if (!preview.enforced) {
        message = t("Đang theo dõi điểm tín nhiệm.");
      } else if (preview.restriction_hours > 0) {
        message = t("Tạm dừng nhận việc mới {{hours}} giờ.", { hours: preview.restriction_hours });
      } else if (preview.projected_score <= 7) {
        message = t("Bạn sẽ nhận cảnh báo về việc hủy buổi.");
      } else {
        message = t("Điểm của buổi này hết hiệu lực sau 30 ngày.");
      }
    }
  }

  return (
    <View className="flex-row items-start gap-2 bg-warning-light rounded-2xl px-3 py-2.5 mb-3">
      <Feather name="alert-triangle" size={16} color={COLORS.warningDark} style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="text-warning-dark font-bold text-sm">{title}</Text>
        {message && <Text className="text-warning-dark text-xs mt-1">{message}</Text>}
      </View>
    </View>
  );
}
