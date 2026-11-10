import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Platform, Text, View } from "react-native";

import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
  relativeDayLabel,
} from "@/utils/format";

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

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
        accessibilityLabel={tr("Xem chi tiết {{value0}}", { value0: tr(item.service_name) })}
        containerStyle={{ marginBottom: 14 }}
        className="bg-surface border border-line"
        style={[{ borderRadius: 20, padding: 16 }, SHADOWS.card, dead && { opacity: 0.75 }]}
      >
        {/* Hàng 1: mã đơn | thu nhập */}
        <View className="flex-row items-center justify-between">
          <View
            className="flex-row items-center flex-1 rounded-xl px-3 py-2"
            style={{ backgroundColor: COLORS.accentLight, marginRight: 16 }}
          >
            <Text
              className="text-ink-muted text-[10px] font-bold mr-2"
              style={{ letterSpacing: 0.6 }}
            >
              {tr("MÃ ĐƠN")}
            </Text>
            <Text
              selectable
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              className="flex-1 text-ink text-[13px] font-extrabold"
              style={{ fontFamily: MONO, letterSpacing: 0.3 }}
            >
              {item.booking_code}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-ink-muted text-[10px]">{tr("Thu nhập")}</Text>
            <Text className="text-primary font-extrabold text-[18px]">{price ?? "—"}</Text>
          </View>
        </View>

        {/* Hàng 2: tên dịch vụ + trạng thái */}
        <View className="flex-row items-center" style={{ marginTop: 16 }}>
          <Text className="flex-1 text-ink font-extrabold text-[16px]" numberOfLines={2}>
            {tr(item.service_name)}
          </Text>
          <View style={{ marginLeft: 8 }}>
            <StatusBadge status={item.status} />
          </View>
        </View>

        {/* Hàng 3: địa chỉ 1 dòng */}
        <View className="flex-row items-center" style={{ marginTop: 6 }}>
          <Feather name="map-pin" size={11} color={COLORS.inkMuted} />
          <Text
            className="flex-1 text-ink-soft text-[11.5px] ml-1.5"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.address_ward ? `${item.address_ward}, ` : ""}
            {item.address_city}
          </Text>
        </View>

        {dead && !!item.cancel_reason && (
          <View className="flex-row items-start bg-danger-light rounded-xl p-2.5" style={{ marginTop: 12 }}>
            <Feather name="info" size={13} color={COLORS.danger} style={{ marginTop: 1 }} />
            <Text className="text-ink-soft text-xs ml-2 flex-1 leading-4" numberOfLines={2}>
              <Text className="font-bold">{tr("Lý do:")} </Text>
              {item.cancel_reason}
            </Text>
          </View>
        )}

        <View className="bg-line" style={{ height: 1, marginTop: 16 }} />

        {/* Hàng 4: thời gian | nút */}
        <View className="flex-row items-center justify-between" style={{ marginTop: 14 }}>
          <View className="flex-1" style={{ marginRight: 12 }}>
            <View className="flex-row items-center">
              <Feather name="calendar" size={12} color={COLORS.ink} />
              <Text className="text-ink text-[12.5px] font-bold ml-1.5 capitalize" numberOfLines={1}>
                {formatDayLabel(item.scheduled_start)}
              </Text>
              {dayChip ? (
                <View className="bg-accent-light rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-ink text-[10px] font-semibold">{dayChip}</Text>
                </View>
              ) : null}
            </View>
            <View className="flex-row items-center" style={{ marginTop: 5 }}>
              <Feather name="clock" size={12} color={COLORS.inkMuted} />
              <Text className="text-ink-soft text-[11.5px] ml-1.5" numberOfLines={1}>
                {formatTime(item.scheduled_start)} - {formatTime(item.scheduled_end)} (
                {formatDuration(item.scheduled_start, item.scheduled_end)})
              </Text>
            </View>
          </View>
          <View
            className={`flex-row items-center rounded-full px-4 ${isDark ? "bg-accent-fill" : "bg-accent-dark"}`}
            style={{ height: 40 }}
          >
            <Text className="text-white text-[12px] font-bold" style={{ letterSpacing: 0.4 }}>
              {tr("CHI TIẾT")}
            </Text>
            <Feather name="arrow-right" size={14} color={COLORS.white} style={{ marginLeft: 5 }} />
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
});