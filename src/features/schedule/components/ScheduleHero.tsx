import { COLORS, ON_DARK, RADIUS, TYPE } from "@/constants/theme";
import type { WeekDayCell } from "@/features/schedule/hooks/useSchedule";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CELL_HEIGHT = 72;
const CELL_GAP = 3;
const CELL_RADIUS = 16;

type ScheduleHeroProps = {
  monthLabel: string;
  yearLabel: string;
  days: WeekDayCell[];
  onBack: () => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: Date) => void;
};

function DayCell({
  day,
  onSelect,
}: {
  day: WeekDayCell;
  onSelect: (date: Date) => void;
}) {
  const selected = useRef(new Animated.Value(day.selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selected, {
      toValue: day.selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false, // đổi màu chữ cần JS driver
    }).start();
  }, [day.selected, selected]);

  const weekdayColor = selected.interpolate({
    inputRange: [0, 1],
    outputRange: [ON_DARK.textSoft, COLORS.inkSoft],
  });
  const numberColor = selected.interpolate({
    inputRange: [0, 1],
    outputRange: [ON_DARK.text, COLORS.ink],
  });

  return (
    <Pressable
      onPress={() => onSelect(day.date)}
      accessibilityRole="button"
      accessibilityState={{ selected: day.selected }}
      style={{
        flex: 1,
        height: CELL_HEIGHT,
        marginHorizontal: CELL_GAP,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.Text
        style={{
          color: weekdayColor,
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
        }}
      >
        {day.weekday}
      </Animated.Text>
      <Animated.Text
        style={{ color: numberColor, fontSize: 18, fontWeight: "800" }}
      >
        {day.dayNumber}
      </Animated.Text>
      <View
        className="w-1.5 h-1.5 rounded-full mt-1"
        style={{
          backgroundColor: day.hasJobs
            ? day.selected
              ? COLORS.primary
              : ON_DARK.textSoft
            : "transparent",
        }}
      />
    </Pressable>
  );
}

export function ScheduleHero({
  monthLabel,
  yearLabel,
  days,
  onBack,
  onToday,
  onPrev,
  onNext,
  onSelect,
}: ScheduleHeroProps) {
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  const selectedIndex = days.findIndex((d) => d.selected);
  const cellWidth = trackWidth / 7;

  // Viên chọn trượt tới ngày được chọn (lần đầu đặt thẳng, không animate)
  useEffect(() => {
    if (!trackWidth || selectedIndex < 0) return;
    const target = selectedIndex * cellWidth;
    if (!placed.current) {
      indicatorX.setValue(target);
      placed.current = true;
      return;
    }
    Animated.spring(indicatorX, {
      toValue: target,
      useNativeDriver: true,
      damping: 16,
      stiffness: 220,
      mass: 0.8,
    }).start();
  }, [trackWidth, selectedIndex, cellWidth, indicatorX]);

  return (
    <View
      className="bg-ink-panel px-5 pb-6 overflow-hidden"
      style={{
        paddingTop: insets.top + 8,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      {/* Họa tiết vòng tròn mờ, đồng bộ với Home */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -70,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: ON_DARK.surface,
          opacity: 0.35,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -50,
          left: -30,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: ON_DARK.surface,
          opacity: 0.25,
        }}
      />

      <View className="flex-row items-center">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: ON_DARK.surface }}
        >
          <Feather name="arrow-left" size={20} color={ON_DARK.text} />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-xl font-extrabold"
            style={{ color: ON_DARK.text }}
          >
            Lịch làm việc
          </Text>
          <Text className="text-xs" style={{ color: ON_DARK.textSoft }}>
            Theo dõi các ca làm của bạn
          </Text>
        </View>
        <Pressable
          onPress={onToday}
          accessibilityRole="button"
          className="rounded-full px-4 flex-row items-center justify-center"
          style={{ height: 40, backgroundColor: ON_DARK.surface }}
        >
          <Feather name="crosshair" size={13} color={ON_DARK.text} />
          <Text
            className="text-xs ml-1.5"
            style={[TYPE.label, { color: ON_DARK.text }]}
          >
            HÔM NAY
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between mt-4 mb-3">
        <Pressable
          onPress={onPrev}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Tuần trước"
          className="w-11 h-11 rounded-full items-center justify-center"
        >
          <Feather name="chevron-left" size={22} color={ON_DARK.text} />
        </Pressable>
        <View className="items-center">
          <Text
            className="text-base font-extrabold"
            style={{ color: ON_DARK.text }}
          >
            {monthLabel}
          </Text>
          <Text className="text-xs" style={{ color: ON_DARK.textMuted }}>
            {yearLabel}
          </Text>
        </View>
        <Pressable
          onPress={onNext}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Tuần sau"
          className="w-11 h-11 rounded-full items-center justify-center"
        >
          <Feather name="chevron-right" size={22} color={ON_DARK.text} />
        </Pressable>
      </View>

      <View
        style={{ height: CELL_HEIGHT }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {/* Lớp 1: nền từng ô */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: CELL_HEIGHT,
            flexDirection: "row",
          }}
        >
          {days.map((day) => (
            <View
              key={day.key}
              style={{
                flex: 1,
                marginHorizontal: CELL_GAP,
                borderRadius: CELL_RADIUS,
                backgroundColor: ON_DARK.surface,
                borderWidth: 1,
                borderColor: day.isToday ? ON_DARK.border : "transparent",
              }}
            />
          ))}
        </View>

        {/* Lớp 2: viên chọn trượt */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: CELL_GAP,
            width: Math.max(cellWidth - CELL_GAP * 2, 0),
            height: CELL_HEIGHT,
            borderRadius: CELL_RADIUS,
            backgroundColor: COLORS.surface,
            opacity: trackWidth > 0 && selectedIndex >= 0 ? 1 : 0,
            transform: [{ translateX: indicatorX }],
          }}
        />

        {/* Lớp 3: chữ và vùng bấm */}
        <View style={{ flexDirection: "row", height: CELL_HEIGHT }}>
          {days.map((day) => (
            <DayCell key={day.key} day={day} onSelect={onSelect} />
          ))}
        </View>
      </View>
    </View>
  );
}
