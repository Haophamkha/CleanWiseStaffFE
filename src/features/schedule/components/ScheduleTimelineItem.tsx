import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import type { ScheduleRow } from "@/features/schedule/hooks/useSchedule";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

const TONE: Record<
  string,
  { label: string; dot: string; badge: string; text: string }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    dot: COLORS.warning,
    badge: "bg-warning-light",
    text: "text-warning-dark",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    dot: COLORS.info,
    badge: "bg-info-light",
    text: "text-info-dark",
  },
  COMPLETED: {
    label: "Hoàn thành",
    dot: COLORS.success,
    badge: "bg-success-light",
    text: "text-success",
  },
  CANCELLED: {
    label: "Đã hủy",
    dot: COLORS.inkMuted,
    badge: "bg-accent-light",
    text: "text-ink-soft",
  },
  MISSED: {
    label: "Đã bỏ lỡ",
    dot: COLORS.danger,
    badge: "bg-danger-light",
    text: "text-danger",
  },
};

type ScheduleTimelineItemProps = {
  row: ScheduleRow;
  onPress: (id: number) => void;
};

export const ScheduleTimelineItem = memo(function ScheduleTimelineItem({
  row,
  onPress,
}: ScheduleTimelineItemProps) {
  const tone = TONE[row.status] ?? TONE.PENDING;

  return (
    <View className="flex-row">
      <View className="w-[54px] items-end pr-3">
        <Text className="text-ink text-sm font-extrabold">
          {row.startLabel}
        </Text>
        <Text className="text-ink-muted text-[11px] mt-1">{row.endLabel}</Text>
      </View>

      <View className="w-5 items-center">
        <View
          className="w-3 h-3 rounded-full mt-1.5"
          style={{ backgroundColor: tone.dot }}
        />
        {!row.isLast && <View className="flex-1 w-[2px] bg-line mt-1" />}
      </View>

      <Pressable onPress={() => onPress(row.id)} className="flex-1 ml-2 mb-5">
        <View
          className="bg-surface border border-line border-l-4 p-4"
          style={[
            { borderRadius: RADIUS.card, borderLeftColor: tone.dot },
            SHADOWS.card,
          ]}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Feather name="clock" size={14} color={COLORS.inkMuted} />
              <Text className="text-ink-soft text-xs ml-1.5">
                {row.durationLabel}
              </Text>
            </View>
            <View className={`px-2.5 py-1 rounded-full ${tone.badge}`}>
              <Text className={`text-[10px] font-bold ${tone.text}`}>
                {tone.label}
              </Text>
            </View>
          </View>

          <Text className="text-ink text-base font-extrabold mb-2">
            {row.service}
          </Text>

          <View className="flex-row items-start mb-4">
            <Feather
              name="map-pin"
              size={15}
              color={COLORS.inkMuted}
              style={{ marginTop: 2 }}
            />
            <Text
              numberOfLines={2}
              className="text-ink-soft text-sm ml-2 flex-1 leading-5"
            >
              {row.location}
            </Text>
          </View>

          <View className="pt-3 border-t border-line flex-row items-center justify-between">
            <View>
              <Text className="text-ink-muted text-[11px] mb-0.5">
                Thu nhập
              </Text>
              <Text className="text-ink font-extrabold text-base">
                {row.priceLabel}
              </Text>
            </View>
            <View className="w-11 h-11 rounded-full bg-canvas items-center justify-center">
              <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
});
