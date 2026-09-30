import { COLORS, ON_DARK, RADIUS, TYPE } from "@/constants/theme";
import type { WeekDayCell } from "@/features/schedule/hooks/useSchedule";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <View
      className="bg-ink px-5 pb-5"
      style={{
        paddingTop: insets.top + 8,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      <View className="flex-row items-center">
        <Pressable
          onPress={onBack}
          hitSlop={8}
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
          className="rounded-full px-4 items-center justify-center"
          style={{ height: 36, backgroundColor: ON_DARK.surface }}
        >
          <Text
            className="text-xs"
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
          className="w-11 h-11 rounded-full items-center justify-center"
        >
          <Feather name="chevron-right" size={22} color={ON_DARK.text} />
        </Pressable>
      </View>

      <View className="flex-row">
        {days.map((day) => (
          <Pressable
            key={day.key}
            onPress={() => onSelect(day.date)}
            className={`flex-1 mx-[3px] h-[72px] rounded-2xl items-center justify-center ${
              day.selected ? "bg-surface" : ""
            }`}
            style={
              day.selected
                ? undefined
                : {
                    backgroundColor: ON_DARK.surface,
                    borderWidth: 1,
                    borderColor: day.isToday ? ON_DARK.border : "transparent",
                  }
            }
          >
            <Text
              className={`text-[11px] font-semibold mb-1 ${
                day.selected ? "text-ink-soft" : ""
              }`}
              style={day.selected ? undefined : { color: ON_DARK.textSoft }}
            >
              {day.weekday}
            </Text>
            <Text
              className={`text-lg font-extrabold ${day.selected ? "text-ink" : ""}`}
              style={day.selected ? undefined : { color: ON_DARK.text }}
            >
              {day.dayNumber}
            </Text>
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
        ))}
      </View>
    </View>
  );
}
