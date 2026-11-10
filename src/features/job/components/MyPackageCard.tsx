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
} from "@/utils/format";

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

export const MyPackageCard = memo(function MyPackageCard({
  bookingId,
  sessions,
  onOpen,
  index = 0,
}: {
  bookingId: number;
  sessions: WorkerMySchedule[];
  onOpen: OpenJob;
  index?: number;
}) {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS, isDark } = useAppTheme();

  const first = sessions[0];
  const total = first.total_sessions ?? sessions.length;
  const price = formatCurrency(first.price);

  const completed =
    first.completed_sessions ??
    sessions.filter((s) => s.status === "COMPLETED").length;
  const accepted = first.accepted_sessions ?? sessions.length;

  const pending = sessions
    .filter((s) => s.status === "PENDING")
    .sort(
      (a, b) =>
        new Date(a.scheduled_start).getTime() -
        new Date(b.scheduled_start).getTime(),
    );
  const inProgress = sessions.find((s) => s.status === "IN_PROGRESS");
  const highlight = inProgress ?? pending[0] ?? sessions[0];

  const topStatus = inProgress
    ? "IN_PROGRESS"
    : pending.length > 0
      ? "PENDING"
      : sessions.some((s) => s.status === "COMPLETED")
        ? "COMPLETED"
        : first.status;

  const highlightLabel = inProgress
    ? tr("Đang thực hiện")
    : pending.length > 0
      ? tr("Buổi gần nhất")
      : topStatus === "COMPLETED"
        ? tr("Buổi hoàn thành gần nhất")
        : tr("Buổi đã hủy");

  const progress = total > 0 ? Math.min(completed / total, 1) * 100 : 0;

  return (
    <FadeInView delay={Math.min(index, 5) * 60}>
      <PressableScale
        onPress={() => onOpen(highlight.id, "mine", bookingId)}
        accessibilityRole="button"
        accessibilityLabel={tr("Xem chi tiết {{value0}}", { value0: tr(first.service_name) })}
        containerStyle={{ marginBottom: 14 }}
        className="bg-surface border border-line"
        style={[{ borderRadius: 20, padding: 16 }, SHADOWS.card]}
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
              {first.booking_code}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-ink-muted text-[10px]">{tr("Thu nhập / buổi")}</Text>
            <Text className="text-primary font-extrabold text-[18px]">{price ?? "—"}</Text>
          </View>
        </View>

        {/* Hàng 2: tên + chip định kỳ + trạng thái */}
        <View className="flex-row items-center" style={{ marginTop: 16 }}>
          <View className="flex-1">
            <Text className="text-ink font-extrabold text-[16px]" numberOfLines={2}>
              {tr(first.service_name)}
            </Text>
            <View className="self-start flex-row items-center bg-accent-light rounded-full px-2 py-0.5" style={{ marginTop: 5 }}>
              <Feather name="repeat" size={10} color={COLORS.accentDark} />
              <Text className="text-accent-dark text-[10.5px] font-semibold ml-1">
                {tr("Định kỳ")}
              </Text>
            </View>
          </View>
          <View style={{ marginLeft: 8 }}>
            <StatusBadge status={topStatus} />
          </View>
        </View>

        {/* Hàng 3: địa chỉ 1 dòng */}
        <View className="flex-row items-center" style={{ marginTop: 8 }}>
          <Feather name="map-pin" size={11} color={COLORS.inkMuted} />
          <Text
            className="flex-1 text-ink-soft text-[11.5px] ml-1.5"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {first.address_ward ? `${first.address_ward}, ` : ""}
            {first.address_city}
          </Text>
        </View>

        {/* Tiến độ */}
        <View style={{ marginTop: 16 }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 6 }}>
            <Text className="text-ink-soft text-[11px] font-semibold">
              {tr("Hoàn thành")} {completed}/{total} {tr("buổi")}
            </Text>
            <Text className="text-ink-muted text-[11px]">
              {tr("Đã nhận")} {accepted}/{total}
            </Text>
          </View>
          <View className="h-1.5 bg-accent-light rounded-full overflow-hidden">
            <View className="h-full bg-accent-dark rounded-full" style={{ width: `${progress}%` }} />
          </View>
        </View>

        <View className="bg-line" style={{ height: 1, marginTop: 16 }} />

        {/* Hàng 4: buổi nổi bật | nút */}
        <View className="flex-row items-center justify-between" style={{ marginTop: 14 }}>
          <View className="flex-1" style={{ marginRight: 12 }}>
            <Text className="text-ink-muted text-[10.5px] font-semibold" numberOfLines={1}>
              {highlightLabel} · {tr("Buổi")} {highlight.sequence_no}/{total}
            </Text>
            <View className="flex-row items-center" style={{ marginTop: 5 }}>
              <Feather name="calendar" size={12} color={COLORS.ink} />
              <Text className="text-ink text-[12.5px] font-bold ml-1.5 capitalize" numberOfLines={1}>
                {formatDayLabel(highlight.scheduled_start)}
              </Text>
            </View>
            <View className="flex-row items-center" style={{ marginTop: 4 }}>
              <Feather name="clock" size={12} color={COLORS.inkMuted} />
              <Text className="text-ink-soft text-[11.5px] ml-1.5" numberOfLines={1}>
                {formatTime(highlight.scheduled_start)} - {formatTime(highlight.scheduled_end)} (
                {formatDuration(highlight.scheduled_start, highlight.scheduled_end)})
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