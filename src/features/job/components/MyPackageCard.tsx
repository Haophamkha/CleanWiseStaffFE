import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";

import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
} from "@/utils/format";

export const MyPackageCard = memo(function MyPackageCard({
  bookingId,
  sessions,
  onOpen,
  index = 0,
}: {
  bookingId: number;
  sessions: WorkerMySchedule[];
  onOpen: OpenJob;
  /** Thứ tự trong danh sách, dùng để xếp so le animation */
  index?: number;
}) {
  const first = sessions[0];
  const total = first.total_sessions ?? sessions.length;
  const price = formatCurrency(first.price);

  const completed = sessions.filter((s) => s.status === "COMPLETED").length;
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
      : "COMPLETED";

  const progress = total > 0 ? Math.min(completed / total, 1) * 100 : 0;

  return (
    <FadeInView delay={Math.min(index, 5) * 60}>
      <PressableScale
        onPress={() => onOpen(highlight.id, "mine", bookingId)}
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${first.service_name}`}
        containerStyle={{ marginBottom: 12 }}
        className="bg-surface border border-line p-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="flex-row items-center bg-accent-light rounded-full px-2.5 py-1 mr-2">
              <Feather name="repeat" size={11} color={COLORS.accentDark} />
              <Text className="text-accent-dark text-xs font-semibold ml-1">
                Định kỳ
              </Text>
            </View>
            <Text className="text-ink-muted text-xs" numberOfLines={1}>
              {first.booking_code}
            </Text>
          </View>
          <StatusBadge status={topStatus} />
        </View>

        <Text
          className="text-ink font-extrabold text-base mb-1.5"
          numberOfLines={1}
        >
          {first.service_name}
        </Text>

        <View className="flex-row items-center mb-3">
          <Feather name="map-pin" size={13} color={COLORS.inkMuted} />
          <Text
            className="text-ink-soft text-sm ml-1.5 flex-1"
            numberOfLines={1}
          >
            {first.address_ward ? `${first.address_ward}, ` : ""}
            {first.address_city}
          </Text>
        </View>

        <View className="bg-canvas border border-line rounded-2xl p-3 mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-ink-soft text-xs font-semibold">
              {inProgress
                ? "Đang thực hiện"
                : pending.length > 0
                  ? "Buổi gần nhất"
                  : "Tất cả buổi đã hoàn thành"}
            </Text>
            <Text className="text-ink-muted text-xs">
              Buổi {highlight.sequence_no}/{total}
            </Text>
          </View>

          <View className="flex-row items-center flex-wrap">
            <Feather name="calendar" size={14} color={COLORS.ink} />
            <Text className="text-ink text-sm font-bold ml-1.5 capitalize">
              {formatDayLabel(highlight.scheduled_start)}
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={14} color={COLORS.inkMuted} />
            <Text className="text-ink-soft text-sm ml-1.5">
              {formatTime(highlight.scheduled_start)} -{" "}
              {formatTime(highlight.scheduled_end)} (
              {formatDuration(
                highlight.scheduled_start,
                highlight.scheduled_end,
              )}
              )
            </Text>
          </View>
        </View>

        {/* Tiến độ gói */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-ink-soft text-xs font-semibold">
              Hoàn thành {completed}/{total} buổi
            </Text>
            <Text className="text-ink-muted text-xs">
              Đã nhận {sessions.length}/{total}
            </Text>
          </View>
          <View className="h-1.5 bg-accent-light rounded-full overflow-hidden">
            <View
              className="h-full bg-accent-dark rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-ink-muted text-xs mb-0.5">
              Thu nhập / buổi
            </Text>
            <Text className="text-ink font-extrabold text-lg">
              {price ?? "—"}
            </Text>
          </View>
          <View
            className="flex-row items-center bg-accent-dark rounded-full pl-5 pr-4"
            style={{ height: 44 }}
          >
            <Text className="text-white text-xs" style={TYPE.button}>
              CHI TIẾT
            </Text>
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
