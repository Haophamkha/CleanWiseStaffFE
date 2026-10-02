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
  formatDateTimeShort,
  formatDuration,
} from "@/utils/format";

/** Card "Của tôi": buổi lẻ (không thuộc gói định kỳ). */
export const MyJobCard = memo(function MyJobCard({
  item,
  onOpen,
  index = 0,
}: {
  item: WorkerMySchedule;
  onOpen: OpenJob;
  /** Thứ tự trong danh sách, dùng để xếp so le animation */
  index?: number;
}) {
  const price = formatCurrency(item.price);

  return (
    <FadeInView delay={Math.min(index, 5) * 60}>
      <PressableScale
        onPress={() => onOpen(item.id, "mine", item.booking_id)}
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${item.service_name}`}
        containerStyle={{ marginBottom: 12 }}
        className="bg-surface border border-line p-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-canvas rounded-full px-2.5 py-1 mr-2 flex-shrink">
            <Text className="text-ink-muted text-xs" numberOfLines={1}>
              {item.booking_code}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <Text
          className="text-ink font-extrabold text-base mb-3"
          numberOfLines={1}
        >
          {item.service_name}
        </Text>

        <View className="flex-row items-start mb-2">
          <View className="w-7 h-7 rounded-full bg-accent-light items-center justify-center mr-2.5">
            <Feather name="calendar" size={13} color={COLORS.accentDark} />
          </View>
          <Text className="text-ink-soft text-sm flex-1 leading-5">
            {formatDateTimeShort(item.scheduled_start)} -{" "}
            {formatDateTimeShort(item.scheduled_end)} (
            {formatDuration(item.scheduled_start, item.scheduled_end)})
          </Text>
        </View>

        <View className="flex-row items-start mb-4">
          <View className="w-7 h-7 rounded-full bg-accent-light items-center justify-center mr-2.5">
            <Feather name="map-pin" size={13} color={COLORS.accentDark} />
          </View>
          <Text className="text-ink-soft text-sm flex-1 leading-5">
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
