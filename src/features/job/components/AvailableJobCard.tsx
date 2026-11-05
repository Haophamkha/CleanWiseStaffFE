import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Platform, Text, View } from "react-native";

import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
  relativeDayLabel,
} from "@/utils/format";

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

export const AvailableJobCard = memo(function AvailableJobCard({
  item,
  onOpen,
  dayFiltered,
  index = 0,
}: {
  item: WorkerSchedule;
  onOpen: OpenJob;
  dayFiltered: boolean;
  index?: number;
}) {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const total = item.total_sessions ?? 1;
  const isPackage = total > 1;
  const remaining = item.available_sessions ?? 1;
  const price = formatCurrency(item.price);
  const dayChip = relativeDayLabel(item.scheduled_start);
  const invitation =
    item.invitation?.status === "PENDING" ? item.invitation : null;
  const preferredMinutes =
    invitation?.expires_at || (item.is_preferred_for_me && item.preferred_until)
      ? Math.ceil(
          (new Date(invitation?.expires_at ?? item.preferred_until!).getTime() -
            Date.now()) /
            60000,
        )
      : 0;
  const isPreferred = preferredMinutes > 0;

  return (
    <FadeInView delay={Math.min(index, 5) * 60}>
      <PressableScale
        onPress={() => onOpen(item.id, "available", item.booking_id)}
        accessibilityRole="button"
        accessibilityLabel={tr("Xem công việc {{value0}}", { value0: tr(item.service_name) })}
        containerStyle={{ marginBottom: 14 }}
        className={`bg-surface border ${isPreferred ? "border-primary" : "border-line"}`}
        style={[{ borderRadius: 20, padding: 16 }, SHADOWS.card]}
      >
        {isPreferred ? (
          <View
            className="self-start flex-row items-center rounded-full px-2.5 py-1"
            style={{ backgroundColor: COLORS.primaryFill, marginBottom: 12 }}
          >
            <Feather name="user-check" size={11} color={COLORS.white} />
            <Text className="text-white text-[11px] font-semibold ml-1">
              {invitation ? tr("Lời mời từ admin") : tr("Khách hàng mời bạn")}  {tr("· còn")}{" "}
              {preferredMinutes} {tr("phút")}
            </Text>
          </View>
        ) : null}

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
            <Text className="text-ink-muted text-[10px]">
              {isPackage ? tr("Thu nhập / buổi") : tr("Thu nhập")}
            </Text>
            <Text className="text-primary font-extrabold text-[18px]">
              {price ?? "—"}
            </Text>
          </View>
        </View>

        {/* Hàng 2: tên dịch vụ + chip */}
        <View className="flex-row items-center" style={{ marginTop: 16 }}>
          <Text className="flex-1 text-ink font-extrabold text-[16px]" numberOfLines={2}>
            {tr(item.service_name)}
          </Text>
          {isPackage ? (
            <View className="flex-row items-center bg-accent-light rounded-full px-2.5 py-1 ml-2">
              <Feather name="repeat" size={10} color={COLORS.accentDark} />
              <Text className="text-accent-dark text-[10.5px] font-semibold ml-1">
                {tr("Định kỳ")} · {tr("Còn")} {remaining}/{total}
              </Text>
            </View>
          ) : null}
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

        {/* Đường kẻ */}
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
                {isPackage ? ` · ${tr("Buổi")} ${item.sequence_no}/${total}` : ""}
              </Text>
            </View>
          </View>
          <View
            className="bg-primary-fill rounded-full px-4 flex-row items-center justify-center"
            style={{ height: 40 }}
          >
            <Text className="text-white text-[12px] font-bold" style={{ letterSpacing: 0.4 }}>
              {isPackage ? tr("CHỌN BUỔI") : tr("XEM CHI TIẾT")}
            </Text>
            <Feather name="chevron-right" size={15} color={COLORS.white} style={{ marginLeft: 2 }} />
          </View>
        </View>
      </PressableScale>
    </FadeInView>
  );
});