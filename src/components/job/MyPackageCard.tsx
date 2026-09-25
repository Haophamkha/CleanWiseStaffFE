import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import type { WorkerMySchedule } from "@/types/Schedule";
import type { OpenJob } from "@/types/jobNav";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
} from "@/utils/format";
import { STATUS_LABEL } from "@/utils/scheduleStatus";

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

  // mới
  let topBadge: { label: string; color: string; bg: string };
  if (inProgress) {
    topBadge = STATUS_LABEL.IN_PROGRESS;
  } else if (pending.length > 0) {
    topBadge = STATUS_LABEL.PENDING;
  } else {
    topBadge = STATUS_LABEL.COMPLETED;
  }

  return (
    <Pressable
      onPress={() => onOpen(highlight.id, "mine", bookingId)}
      className="bg-white rounded-2xl mb-3 border border-[#F3F4F6] p-4"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="flex-row items-center bg-[#EEF2FF] rounded-full px-2 py-1 mr-2">
            <Feather name="repeat" size={11} color="#2563EB" />
            <Text className="text-[#2563EB] text-xs font-semibold ml-1">
              Định kỳ
            </Text>
          </View>
          <Text className="text-[#9CA3AF] text-xs" numberOfLines={1}>
            {first.booking_code}
          </Text>
        </View>

        <View
          style={{ backgroundColor: topBadge.bg }}
          className="px-2.5 py-1 rounded-full"
        >
          <Text
            style={{ color: topBadge.color }}
            className="text-xs font-semibold"
          >
            {topBadge.label}
          </Text>
        </View>
      </View>

      <Text
        className="text-[#111827] font-bold text-base mb-1.5"
        numberOfLines={1}
      >
        {first.service_name}
      </Text>

      <View className="flex-row items-center mb-2">
        <Feather name="map-pin" size={13} color="#9CA3AF" />
        <Text
          className="text-[#6B7280] text-sm ml-1.5 flex-1"
          numberOfLines={1}
        >
          {first.address_ward ? `${first.address_ward}, ` : ""}
          {first.address_city}
        </Text>
      </View>

      <View className="bg-[#F5F8FF] border border-[#DBE7FF] rounded-xl p-3 mb-3">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-[#2563EB] text-xs font-semibold">
            {inProgress
              ? "Đang thực hiện"
              : pending.length > 0
                ? "Buổi gần nhất"
                : "Tất cả buổi đã hoàn thành"}
          </Text>
          <Text className="text-[#6B7280] text-xs">
            Buổi {highlight.sequence_no}/{total}
          </Text>
        </View>

        <View className="flex-row items-center flex-wrap">
          <Feather name="calendar" size={14} color="#2563EB" />
          <Text className="text-[#111827] text-sm font-semibold ml-1.5 capitalize">
            {formatDayLabel(highlight.scheduled_start)}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Feather name="clock" size={14} color="#6B7280" />
          <Text className="text-[#6B7280] text-sm ml-1.5">
            {formatTime(highlight.scheduled_start)} -{" "}
            {formatTime(highlight.scheduled_end)} (
            {formatDuration(highlight.scheduled_start, highlight.scheduled_end)}
            )
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[#9CA3AF] text-xs mb-0.5">Thu nhập / buổi</Text>
          <Text className="text-[#111827] font-bold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <Text className="text-[#111827] text-sm font-bold">
          Đã nhận {sessions.length}/{total} · Hoàn thành {completed}
        </Text>
      </View>
    </Pressable>
  );
});
