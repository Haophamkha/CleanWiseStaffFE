import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import {
  formatCurrency,
  formatDateTimeShort,
  formatDuration,
} from "@/utils/format";

/** Card "Của tôi": buổi lẻ (không thuộc gói định kỳ). */
export const MyJobCard = memo(function MyJobCard({
  item,
  onOpen,
}: {
  item: WorkerMySchedule;
  onOpen: OpenJob;
}) {
  const price = formatCurrency(item.price);

  return (
    <View
      className="bg-surface border border-line p-4 mb-3"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink-muted text-xs">{item.booking_code}</Text>
        <StatusBadge status={item.status} />
      </View>

      <Text
        className="text-ink font-extrabold text-base mb-2"
        numberOfLines={1}
      >
        {item.service_name}
      </Text>

      <View className="flex-row items-center mb-1">
        <Feather name="calendar" size={13} color={COLORS.inkMuted} />
        <Text className="text-ink-soft text-sm ml-1.5">
          {formatDateTimeShort(item.scheduled_start)} -{" "}
          {formatDateTimeShort(item.scheduled_end)} (
          {formatDuration(item.scheduled_start, item.scheduled_end)})
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Feather name="map-pin" size={13} color={COLORS.inkMuted} />
        <Text className="text-ink-soft text-sm ml-1.5">
          {item.address_ward ? `${item.address_ward}, ` : ""}
          {item.address_city}
        </Text>
      </View>

      <View className="h-[1px] bg-line mb-3" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-ink-muted text-xs mb-0.5">Thu nhập</Text>
          <Text className="text-ink font-extrabold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <Pressable
          onPress={() => onOpen(item.id, "mine", item.booking_id)}
          className="border border-ink rounded-full px-5 items-center justify-center"
          style={{ height: 44 }}
        >
          <Text className="text-ink text-xs" style={TYPE.button}>
            CHI TIẾT
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
