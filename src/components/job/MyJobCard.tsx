import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import type { WorkerMySchedule } from "@/types/Schedule";
import type { OpenJob } from "@/types/jobNav";
import {
  formatCurrency,
  formatDateTimeShort,
  formatDuration,
} from "@/utils/format";
import { STATUS_LABEL } from "@/utils/scheduleStatus";

/** Card "Của tôi": buổi lẻ (không thuộc gói định kỳ). */
export const MyJobCard = memo(function MyJobCard({
  item,
  onOpen,
}: {
  item: WorkerMySchedule;
  onOpen: OpenJob;
}) {
  const badge = STATUS_LABEL[item.status] ?? STATUS_LABEL.PENDING;
  const price = formatCurrency(item.price);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-[#F3F4F6]">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[#9CA3AF] text-xs">{item.booking_code}</Text>
        <View
          style={{ backgroundColor: badge.bg }}
          className="px-2 py-1 rounded-full"
        >
          <Text style={{ color: badge.color }} className="text-xs font-medium">
            {badge.label}
          </Text>
        </View>
      </View>

      <Text
        className="text-[#111827] font-bold text-base mb-2"
        numberOfLines={1}
      >
        {item.service_name}
      </Text>

      <View className="flex-row items-center mb-1">
        <Feather name="calendar" size={13} color="#9CA3AF" />
        <Text className="text-[#6B7280] text-sm ml-1.5">
          {formatDateTimeShort(item.scheduled_start)} -{" "}
          {formatDateTimeShort(item.scheduled_end)} (
          {formatDuration(item.scheduled_start, item.scheduled_end)})
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Feather name="map-pin" size={13} color="#9CA3AF" />
        <Text className="text-[#6B7280] text-sm ml-1.5">
          {item.address_ward ? `${item.address_ward}, ` : ""}
          {item.address_city}
        </Text>
      </View>

      <View className="h-[1px] bg-[#F3F4F6] mb-3" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[#9CA3AF] text-xs mb-0.5">Thu nhập</Text>
          <Text className="text-[#111827] font-bold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <Pressable
          onPress={() => onOpen(item.id, "mine", item.booking_id)}
          className="border border-[#2563EB] rounded-xl px-5 py-2.5"
        >
          <Text className="text-[#2563EB] font-semibold text-sm">Chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );
});
