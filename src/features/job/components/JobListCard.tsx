import { serviceDisplayName } from "@/utils/serviceDisplayName";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { formatDistance, haversineKm, type GeoPoint } from "@/hooks/useDistanceToAddress";
import { formatCurrency, formatDayLabel, formatTime } from "@/utils/format";

type JobListCardProps = {
  item: WorkerSchedule;
  location: GeoPoint | null;
  onPress: () => void;
  index: number;
  available?: boolean;
  perSession?: boolean;
  invitation?: string;
  badges?: ReactNode;
};

export function JobListCard({
  item,
  location,
  onPress,
  index,
  available = false,
  perSession,
  invitation,
  badges,
}: JobListCardProps) {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS, isDark } = useAppTheme();
  const serviceName = tr(serviceDisplayName(item.service_name));
  const date = formatDayLabel(item.scheduled_start, tr);
  const time = `${formatTime(item.scheduled_start, tr)}–${formatTime(item.scheduled_end, tr)}`;
  const price = formatCurrency(item.price, tr);
  const ward = item.address_ward?.trim();
  const latitude = Number(String(item.address_latitude ?? "").trim() || NaN);
  const longitude = Number(String(item.address_longitude ?? "").trim() || NaN);
  const distanceKm = location && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? haversineKm(location, { latitude, longitude })
    : item.distance_km;
  const distance = distanceKm != null && Number.isFinite(distanceKm) && distanceKm >= 0
    ? formatDistance(distanceKm)
    : null;
  const actionLabel = available
    ? tr(perSession ? "CHỌN BUỔI" : "XEM CHI TIẾT")
    : tr("CHI TIẾT");

  return (
    <FadeInView
      delay={Math.min(index, 5) * 60}
      style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={tr("Xem công việc {{value0}}", { value0: serviceName })}
        accessibilityHint={actionLabel}
        containerStyle={{ marginHorizontal: 6, marginBottom: 10 }}
        className={`gap-2.5 rounded-2xl border bg-surface px-4 py-3.5 ${invitation ? "border-primary" : "border-line"}`}
        style={SHADOWS.card}
      >
        {invitation ? (
          <View className="flex-row items-center gap-1.5">
            <Feather name="user-check" size={12} color={COLORS.primaryDark} />
            <Text className="shrink text-xs font-semibold text-primary-dark">{invitation}</Text>
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold text-ink" numberOfLines={1}>{serviceName}</Text>
            {ward || distance ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Feather name="map-pin" size={12} color={COLORS.inkMuted} />
                {ward ? <Text className="min-w-0 shrink text-[13px] text-ink-soft" numberOfLines={1}>{ward}</Text> : null}
                {distance ? (
                  <Text className="text-[13px] font-semibold text-ink-soft">{ward ? "\u00B7 " : ""}{distance}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View className="items-end">
            <Text className="text-[10px] text-ink-muted">{tr(perSession ? "Thu nhập / buổi" : "Thu nhập")}</Text>
            <Text className="text-lg font-extrabold text-primary-dark">{price ?? "\u2014"}</Text>
          </View>
        </View>

        {badges ? (
          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">{badges}</View>
        ) : null}

        <View className="flex-row items-center justify-between gap-3 border-t border-line pt-3">
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
                <Feather name="calendar" size={13} color={COLORS.inkMuted} />
                <Text className="capitalize text-[13px] font-bold text-ink">{date}</Text>
              </View>
            <View className="flex-row items-center gap-1.5">
              <Feather name="clock" size={13} color={COLORS.inkMuted} />
              <Text className="text-[13px] text-ink-soft">{time}</Text>
            </View>
          </View>
          <View
            className={`h-10 flex-row items-center justify-center gap-1 rounded-full px-4 ${
              available ? "bg-primary-fill" : isDark ? "bg-accent-fill" : "bg-accent-dark"
            }`}
          >
            <Text numberOfLines={1} className="text-xs font-bold text-white">{actionLabel}</Text>
            <Feather name={available ? "chevron-right" : "arrow-right"} size={14} color={COLORS.white} />
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
}
