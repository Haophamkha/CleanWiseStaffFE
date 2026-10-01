import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import type { ScheduleRow } from "@/features/schedule/hooks/useSchedule";
import { Feather } from "@expo/vector-icons";
import { memo, useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

const DOT_COLOR: Record<string, string> = {
  PENDING: COLORS.warning,
  IN_PROGRESS: COLORS.info,
  COMPLETED: COLORS.success,
  CANCELLED: COLORS.inkMuted,
  MISSED: COLORS.danger,
};

/** Chấm mốc trên timeline; ca đang thực hiện có vòng sóng lan ra. */
function StatusDot({ color, pulse }: { color: string; pulse: boolean }) {
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, wave]);

  const scale = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.6],
  });
  const opacity = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View
      style={{
        width: 14,
        height: 14,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {pulse && (
        <Animated.View
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          }}
        />
      )}
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

type ScheduleTimelineItemProps = {
  row: ScheduleRow;
  onPress: (id: number) => void;
  /** Thứ tự trong danh sách, dùng để xếp so le animation */
  index?: number;
};

export const ScheduleTimelineItem = memo(function ScheduleTimelineItem({
  row,
  onPress,
  index = 0,
}: ScheduleTimelineItemProps) {
  const dotColor = DOT_COLOR[row.status] ?? COLORS.warning;

  return (
    <FadeInView delay={80 + Math.min(index, 6) * 70}>
      <View className="flex-row">
        <View className="w-[54px] items-end pr-3">
          <Text className="text-ink text-sm font-extrabold">
            {row.startLabel}
          </Text>
          <Text className="text-ink-muted text-[11px] mt-1">
            {row.endLabel}
          </Text>
        </View>

        <View className="w-5 items-center">
          <StatusDot color={dotColor} pulse={row.status === "IN_PROGRESS"} />
          {!row.isLast && <View className="flex-1 w-[2px] bg-line mt-1" />}
        </View>

        <PressableScale
          onPress={() => onPress(row.id)}
          accessibilityRole="button"
          containerStyle={{ flex: 1, marginLeft: 8, marginBottom: 20 }}
        >
          <View
            className="bg-surface border border-line border-l-4 p-4"
            style={[
              { borderRadius: RADIUS.card, borderLeftColor: dotColor },
              SHADOWS.card,
            ]}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center bg-canvas rounded-full px-2.5 py-1">
                <Feather name="clock" size={12} color={COLORS.inkMuted} />
                <Text className="text-ink-soft text-xs ml-1.5 font-semibold">
                  {row.durationLabel}
                </Text>
              </View>
              <StatusBadge status={row.status} />
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
                <Feather
                  name="chevron-right"
                  size={18}
                  color={COLORS.inkMuted}
                />
              </View>
            </View>
          </View>
        </PressableScale>
      </View>
    </FadeInView>
  );
});
