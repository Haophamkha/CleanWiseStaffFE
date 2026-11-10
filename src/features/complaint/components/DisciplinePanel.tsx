import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { RADIUS, TYPE } from "@/constants/theme";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { formatDateTime } from "@/utils/format";
import { useGetDisciplineQuery, type DisciplineCase } from "../api/disciplineApi";
import { ComplaintSheet } from "./ComplaintSheet";

export function DisciplinePanel() {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [appeal, setAppeal] = useState<DisciplineCase | null>(null);
  const { currentData: data, isFetching, isError, refetch } = useGetDisciplineQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  if (isError) {
    return (
      <View className="p-4">
        <EmptyState icon="alert-circle" title={t("Không tải được điểm tín nhiệm")} actionLabel={t("Thử lại")} onAction={refetch} />
      </View>
    );
  }
  if (!data) return <ActivityIndicator className="mt-5" color={COLORS.primary} />;

  const { summary } = data;
  const cardStyle = [{ borderRadius: RADIUS.card }, SHADOWS.card];
  const availability = !summary.enforced
    ? t("Đang theo dõi điểm tín nhiệm.")
    : summary.status === "BANNED"
      ? t("Hồ sơ đã bị cấm nhận việc.")
      : summary.restricted_until
        ? t("Tạm dừng nhận việc mới đến {{time}}", { time: formatDateTime(summary.restricted_until, t) })
        : t("Bạn có thể nhận việc mới.");
  const level = summary.status === "REVIEW"
    ? t("Chờ xét hồ sơ")
    : summary.status === "SUSPENDED"
      ? t("Tạm khóa hồ sơ")
      : summary.status === "WARNING"
        ? t("Cảnh báo")
        : null;

  return (
    <>
      <FlatList
        data={data.results}
        keyExtractor={(item) => String(item.id)}
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 + bottom }}
        ListHeaderComponent={(
          <View className="bg-surface border border-line p-4 mb-3" style={cardStyle}>
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-accent-light items-center justify-center mr-2">
                <Feather name="shield" size={17} color={COLORS.accentDark} />
              </View>
              <Text className="text-ink-soft text-xs flex-1" style={TYPE.label}>{t("Điểm tín nhiệm · 30 ngày")}</Text>
            </View>
            <Text className="text-ink text-3xl font-extrabold mt-1">{summary.score}<Text className="text-ink-muted text-base"> / {summary.max_score}</Text></Text>
            <View
              className="flex-row gap-1 my-3"
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={t("Điểm tín nhiệm · 30 ngày")}
              accessibilityValue={{ min: 0, max: summary.max_score, now: summary.score }}
            >
              {Array.from({ length: summary.max_score }, (_, index) => (
                <View key={index} className={`h-1.5 rounded-full flex-1 ${index < summary.score ? "bg-ink" : "bg-surface-muted"}`} />
              ))}
            </View>
            {level && <Text className="text-warning-dark font-bold mb-1">{level}</Text>}
            <Text className="text-ink text-sm">{availability}</Text>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="check-circle" title={t("Chưa có lần bị trừ điểm.")} />}
        renderItem={({ item }) => (
          <View className="bg-surface border border-line p-4 mb-3" style={cardStyle}>
            <View className="flex-row justify-between gap-2">
              <Text
                className="text-ink text-sm font-extrabold flex-1"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {item.booking_code} · {t("Buổi")} {item.sequence}
              </Text>
              <Text className={`text-sm font-bold ${item.status === "CONFIRMED" ? "text-danger" : "text-ink-soft"}`}>
                {item.status === "CONFIRMED" ? `−${item.deduction}` : item.status_label}
              </Text>
            </View>
            <Text className="text-ink-soft text-sm mt-1">{item.kind_label}</Text>
            {!!item.reason && <Text className="text-ink-soft text-xs mt-1">{item.reason}</Text>}
            {item.status === "CONFIRMED" && (
              <Text className="text-ink-muted text-xs mt-1">
                {t("Hết hiệu lực {{time}}", { time: formatDateTime(item.expires_at, t) })}
              </Text>
            )}
            {!!item.review_note && <Text className="text-ink text-sm mt-2">{item.review_note}</Text>}
            {!!item.sanction && item.sanction !== "PROPOSED" && (
              <Text className="text-danger text-sm mt-2">{item.sanction_label} · {item.sanction_note}</Text>
            )}
            {item.appeal_id !== null && (
              <PressableScale accessibilityRole="button" onPress={() => router.push(`/complaints/${item.appeal_id}` as any)} className="py-3">
                <Text className="text-primary font-bold">{t("Xem khiếu nại")}</Text>
              </PressableScale>
            )}
            {item.can_appeal && data.appeal_issue_type !== null && (
              <PressableScale accessibilityRole="button" onPress={() => setAppeal(item)} className="py-3">
                <Text className="text-primary font-bold">{t("Yêu cầu xem xét")}</Text>
              </PressableScale>
            )}
          </View>
        )}
        ListFooterComponent={data.previous || data.next ? (
          <View className="flex-row justify-between">
            <PressableScale disabled={!data.previous} onPress={() => setPage(page - 1)} className="p-3">
              <Text className={data.previous ? "text-primary" : "text-ink-muted"}>{t("Trang trước")}</Text>
            </PressableScale>
            <PressableScale disabled={!data.next} onPress={() => setPage(page + 1)} className="p-3">
              <Text className={data.next ? "text-primary" : "text-ink-muted"}>{t("Trang sau")}</Text>
            </PressableScale>
          </View>
        ) : undefined}
      />
      {data.appeal_issue_type !== null && (
        <ComplaintSheet
          visible={appeal !== null}
          bookingId={appeal?.booking ?? 0}
          scheduleId={appeal?.schedule ?? 0}
          discipline={{ caseId: appeal?.id ?? 0, issueTypeId: data.appeal_issue_type }}
          onClose={() => setAppeal(null)}
        />
      )}
    </>
  );
}
