import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";

import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RADIUS, TYPE } from "@/constants/theme";
import { BookingCodeStrip } from "@/features/job/components/BookingCodeStrip";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
  relativeDayLabel,
} from "@/utils/format";

/** Card "Của tôi": buổi lẻ (không thuộc gói định kỳ). */
export const MyJobCard = memo(function MyJobCard({
  item,
  onOpen,
  index = 0,
}: {
  item: WorkerMySchedule;
  onOpen: OpenJob;
  index?: number;
}) {
  const { t: tr } = useTranslation();

  const { COLORS, SHADOWS, isDark } = useAppTheme();

  const price = formatCurrency(item.price);
  const live = item.status === "PENDING" || item.status === "IN_PROGRESS";
  const dayChip = live ? relativeDayLabel(item.scheduled_start) : null;
  const dead = item.status === "CANCELLED" || item.status === "MISSED";

  return (
    <FadeInView delay={Math.min(index, 5) * 60}>
      <PressableScale
        onPress={() => onOpen(item.id, "mine", item.booking_id)}
        accessibilityRole="button"
        accessibilityLabel={tr("Xem chi tiết {{value0}}", { value0: item.service_name })}
        containerStyle={{ marginBottom: 12 }}
        className="bg-surface border border-line p-4"
        style={[
          { borderRadius: RADIUS.card },
          SHADOWS.card,
          dead && { opacity: 0.75 },
        ]}
      >
        <BookingCodeStrip code={item.booking_code} />

        <Text className="text-ink font-extrabold text-base" numberOfLines={2}>
          {item.service_name}
        </Text>

        <View className="flex-row items-center mt-2 mb-3">
          <StatusBadge status={item.status} />
          {dayChip ? (
            <View className="bg-accent-light rounded-full px-2.5 py-1 ml-2">
              <Text className="text-ink text-xs font-semibold">{dayChip}</Text>
            </View>
          ) : null}
        </View>

        <View className="bg-canvas border border-line rounded-2xl p-3">
          <View className="flex-row items-center">
            <Feather name="calendar" size={14} color={COLORS.ink} />
            <Text className="text-ink text-sm font-bold ml-1.5 capitalize">
              {formatDayLabel(item.scheduled_start)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1.5">
            <Feather name="clock" size={14} color={COLORS.inkMuted} />
            <Text className="text-ink-soft text-sm ml-1.5">
              {formatTime(item.scheduled_start)} -{" "}
              {formatTime(item.scheduled_end)} (
              {formatDuration(item.scheduled_start, item.scheduled_end)})
            </Text>
          </View>
          <View className="flex-row items-center mt-1.5">
            <Feather name="map-pin" size={14} color={COLORS.inkMuted} />
            <Text
              className="text-ink-soft text-sm ml-1.5 flex-1"
              numberOfLines={1}
            >
              {item.address_ward ? `${item.address_ward}, ` : ""}
              {item.address_city}
            </Text>
          </View>
        </View>
        {dead && !!item.cancel_reason && (
          <View className="flex-row items-start bg-danger-light rounded-2xl p-3 mt-3">
            <Feather
              name="info"
              size={14}
              color={COLORS.danger}
              style={{ marginTop: 2 }}
            />
            <Text className="text-ink-soft text-xs ml-2 flex-1 leading-4">
              <Text className="font-bold">{tr("Lý do:")} </Text>
              {item.cancel_reason}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mt-4">
          <View>
            <Text className="text-ink-muted text-xs mb-0.5">{tr("Thu nhập")}</Text>
            <Text className="text-ink font-extrabold text-lg">
              {price ?? "—"}
            </Text>
          </View>
          <View
            className={`flex-row items-center rounded-full pl-5 pr-4 ${isDark ? "bg-accent-fill" : "bg-accent-dark"}`}
            style={{ height: 44 }}
          >
            <Text className="text-white text-xs" style={TYPE.button}>
              {tr("CHI TIẾT")}</Text>
            <Feather
              name="arrow-right"
              size={16}
              color={COLORS.white}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
});
