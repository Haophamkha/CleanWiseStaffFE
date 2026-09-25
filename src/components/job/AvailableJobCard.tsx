import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import type { WorkerSchedule } from "@/types/Schedule";
import type { OpenJob } from "@/types/jobNav";
import {
  formatCurrency,
  formatDayLabel,
  formatDuration,
  formatTime,
  relativeDayLabel,
} from "@/utils/format";

export const AvailableJobCard = memo(function AvailableJobCard({
  item,
  onOpen,
  dayFiltered,
}: {
  item: WorkerSchedule;
  onOpen: OpenJob;
  dayFiltered: boolean;
}) {
  const total = item.total_sessions ?? 1;
  const isPackage = total > 1;
  const remaining = item.available_sessions ?? 1;
  const price = formatCurrency(item.price);
  const dayChip = relativeDayLabel(item.scheduled_start);

  return (
    <Pressable
      onPress={() => onOpen(item.id, "available", item.booking_id)}
      className="bg-white rounded-2xl mb-3 border border-[#F3F4F6] p-4"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          {isPackage ? (
            <View className="flex-row items-center bg-[#EEF2FF] rounded-full px-2 py-1 mr-2">
              <Feather name="repeat" size={11} color="#2563EB" />
              <Text className="text-[#2563EB] text-xs font-semibold ml-1">
                Định kỳ
              </Text>
            </View>
          ) : null}
          <Text className="text-[#9CA3AF] text-xs" numberOfLines={1}>
            {item.booking_code}
          </Text>
        </View>

        {isPackage ? (
          <View className="bg-[#FEF3C7] rounded-full px-2.5 py-1">
            <Text className="text-[#92400E] text-xs font-semibold">
              Còn {remaining}/{total} buổi
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        className="text-[#111827] font-bold text-base mb-1.5"
        numberOfLines={1}
      >
        {item.service_name}
      </Text>

      <View className="flex-row items-center">
        <Feather name="map-pin" size={13} color="#9CA3AF" />
        <Text
          className="text-[#6B7280] text-sm ml-1.5 flex-1"
          numberOfLines={1}
        >
          {item.address_ward ? `${item.address_ward}, ` : ""}
          {item.address_city}
        </Text>
      </View>

      <View className="bg-[#F5F8FF] border border-[#DBE7FF] rounded-xl p-3 mt-3">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-[#2563EB] text-xs font-semibold">
            {isPackage
              ? dayFiltered
                ? "Buổi trống trong ngày"
                : "Buổi gần nhất chưa nhận"
              : "Thời gian làm việc"}
          </Text>
          {isPackage ? (
            <Text className="text-[#6B7280] text-xs">
              Buổi {item.sequence_no}/{total}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center flex-wrap">
          <Feather name="calendar" size={14} color="#2563EB" />
          <Text className="text-[#111827] text-sm font-semibold ml-1.5 capitalize">
            {formatDayLabel(item.scheduled_start)}
          </Text>
          {dayChip ? (
            <View className="bg-[#FEE2E2] rounded-full px-2 py-0.5 ml-2">
              <Text className="text-[#B91C1C] text-xs font-semibold">
                {dayChip}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center mt-1">
          <Feather name="clock" size={14} color="#6B7280" />
          <Text className="text-[#6B7280] text-sm ml-1.5">
            {formatTime(item.scheduled_start)} -{" "}
            {formatTime(item.scheduled_end)} (
            {formatDuration(item.scheduled_start, item.scheduled_end)})
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <View>
          <Text className="text-[#9CA3AF] text-xs mb-0.5">
            {isPackage ? "Thu nhập / buổi" : "Thu nhập"}
          </Text>
          <Text className="text-[#111827] font-bold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <View className="bg-[#2563EB] rounded-xl px-5 py-2.5 flex-row items-center">
          <Text className="text-white font-semibold text-sm">
            {isPackage ? "Chọn buổi" : "Nhận việc"}
          </Text>
          {isPackage ? (
            <Feather
              name="chevron-right"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 2 }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});
