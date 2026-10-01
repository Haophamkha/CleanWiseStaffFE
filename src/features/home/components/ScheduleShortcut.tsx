import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, ON_DARK, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, View } from "react-native";

type ScheduleShortcutProps = { onPress: () => void };

/** Tờ lịch nhỏ hiển thị ngày hôm nay */
function CalendarTile() {
  const { month, day } = useMemo(() => {
    const d = new Date();
    return {
      month: `THG ${d.getMonth() + 1}`,
      day: String(d.getDate()).padStart(2, "0"),
    };
  }, []);

  return (
    <View
      className="bg-surface overflow-hidden items-center mr-4"
      style={[{ width: 62, borderRadius: 18 }, SHADOWS.card]}
    >
      <View className="bg-primary w-full items-center py-1">
        <Text
          style={[TYPE.label, { color: ON_DARK.text, fontSize: 10 }]}
          numberOfLines={1}
        >
          {month}
        </Text>
      </View>
      <Text className="text-ink text-2xl font-extrabold py-1.5">{day}</Text>
    </View>
  );
}

/** Lối vào màn Lịch làm việc, đặt dưới thẻ thống kê của Home. */
export function ScheduleShortcut({ onPress }: ScheduleShortcutProps) {
  return (
    <View className="px-5 mt-5">
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Mở lịch làm việc"
        className="flex-row items-center bg-accent-light border border-line overflow-hidden px-4 py-4"
        style={[{ borderRadius: RADIUS.card, minHeight: 88 }, SHADOWS.card]}
      >
        {/* Họa tiết vòng tròn mờ */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -40,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: COLORS.surface,
            opacity: 0.55,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -34,
            right: 60,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.surface,
            opacity: 0.4,
          }}
        />

        <CalendarTile />

        <View className="flex-1">
          <Text className="text-ink text-base font-extrabold">
            Lịch làm việc
          </Text>
          <Text className="text-ink-soft text-xs mt-0.5">
            Xem các ca làm của bạn theo tuần
          </Text>
        </View>

        <Feather
          name="chevron-right"
          size={30}
          color={COLORS.ink}
          style={{ marginLeft: 8 }}
        />
      </PressableScale>
    </View>
  );
}
