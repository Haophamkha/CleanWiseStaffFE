import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
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
      className="bg-surface border border-line p-4 mb-3"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          {isPackage ? (
            <View className="flex-row items-center bg-accent-light rounded-full px-2.5 py-1 mr-2">
              <Feather name="repeat" size={11} color={COLORS.accentDark} />
              <Text className="text-accent-dark text-xs font-semibold ml-1">
                Định kỳ
              </Text>
            </View>
          ) : null}
          <Text className="text-ink-muted text-xs" numberOfLines={1}>
            {item.booking_code}
          </Text>
        </View>

        {isPackage ? (
          <View className="bg-warning-light rounded-full px-2.5 py-1">
            <Text className="text-warning-dark text-xs font-semibold">
              Còn {remaining}/{total} buổi
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        className="text-ink font-extrabold text-base mb-1.5"
        numberOfLines={1}
      >
        {item.service_name}
      </Text>

      <View className="flex-row items-center">
        <Feather name="map-pin" size={13} color={COLORS.inkMuted} />
        <Text className="text-ink-soft text-sm ml-1.5 flex-1" numberOfLines={1}>
          {item.address_ward ? `${item.address_ward}, ` : ""}
          {item.address_city}
        </Text>
      </View>

      <View className="bg-canvas border border-line rounded-2xl p-3 mt-3">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-ink-soft text-xs font-semibold">
            {isPackage
              ? dayFiltered
                ? "Buổi trống trong ngày"
                : "Buổi gần nhất chưa nhận"
              : "Thời gian làm việc"}
          </Text>
          {isPackage ? (
            <Text className="text-ink-muted text-xs">
              Buổi {item.sequence_no}/{total}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center flex-wrap">
          <Feather name="calendar" size={14} color={COLORS.ink} />
          <Text className="text-ink text-sm font-bold ml-1.5 capitalize">
            {formatDayLabel(item.scheduled_start)}
          </Text>
          {dayChip ? (
            <View className="bg-accent-light rounded-full px-2 py-0.5 ml-2">
              <Text className="text-ink text-xs font-semibold">{dayChip}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center mt-1">
          <Feather name="clock" size={14} color={COLORS.inkMuted} />
          <Text className="text-ink-soft text-sm ml-1.5">
            {formatTime(item.scheduled_start)} -{" "}
            {formatTime(item.scheduled_end)} (
            {formatDuration(item.scheduled_start, item.scheduled_end)})
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <View>
          <Text className="text-ink-muted text-xs mb-0.5">
            {isPackage ? "Thu nhập / buổi" : "Thu nhập"}
          </Text>
          <Text className="text-ink font-extrabold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <View
          className="bg-primary rounded-full px-5 flex-row items-center justify-center"
          style={{ height: 44 }}
        >
          <Text className="text-white text-xs" style={TYPE.button}>
            {isPackage ? "CHỌN BUỔI" : "NHẬN VIỆC"}
          </Text>
          {isPackage ? (
            <Feather
              name="chevron-right"
              size={16}
              color={COLORS.white}
              style={{ marginLeft: 2 }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});
