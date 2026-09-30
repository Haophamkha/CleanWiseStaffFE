import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
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
}: {
  bookingId: number;
  sessions: WorkerMySchedule[];
  onOpen: OpenJob;
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

  return (
    <Pressable
      onPress={() => onOpen(highlight.id, "mine", bookingId)}
      className="bg-surface border border-line p-4 mb-3"
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

      <View className="flex-row items-center mb-2">
        <Feather name="map-pin" size={13} color={COLORS.inkMuted} />
        <Text className="text-ink-soft text-sm ml-1.5 flex-1" numberOfLines={1}>
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
            {formatDuration(highlight.scheduled_start, highlight.scheduled_end)}
            )
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-ink-muted text-xs mb-0.5">Thu nhập / buổi</Text>
          <Text className="text-ink font-extrabold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <Text className="text-ink-soft text-xs font-bold">
          Đã nhận {sessions.length}/{total} · Hoàn thành {completed}
        </Text>
      </View>
    </Pressable>
  );
});
