import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { COLORS, RADIUS, TYPE } from "@/constants/theme";
import { DayFilterBar } from "@/features/job/components/DayFilterBar";
import type { Tab } from "@/features/job/types/jobNav";
import type { DayChip } from "@/utils/dayChips";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: { key: Tab; label: string; subtitle: string }[] = [
  {
    key: "available",
    label: "Khả dụng",
    subtitle: "Chọn việc phù hợp để nhận",
  },
  { key: "mine", label: "Của tôi", subtitle: "Các buổi bạn đã nhận" },
];

const TRACK_PADDING = 4;
const TAB_HEIGHT = 44;

type JobsHeaderProps = {
  tab: Tab;
  onSwitchTab: (tab: Tab) => void;
  dayChips: DayChip[];
  day: string | null;
  onSelectDay: (key: string | null) => void;
};

function TabLabel({ label, active }: { label: string; active: boolean }) {
  const value = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: false, // đổi màu chữ cần JS driver
    }).start();
  }, [active, value]);

  const color = value.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inkSoft, COLORS.white],
  });

  return (
    <Animated.Text style={[TYPE.label, { color, fontSize: 12 }]}>
      {label.toUpperCase()}
    </Animated.Text>
  );
}

export function JobsHeader({
  tab,
  onSwitchTab,
  dayChips,
  day,
  onSelectDay,
}: JobsHeaderProps) {
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  const activeIndex = Math.max(
    TABS.findIndex((t) => t.key === tab),
    0,
  );
  const tabWidth = Math.max((trackWidth - TRACK_PADDING * 2) / TABS.length, 0);

  useEffect(() => {
    if (!trackWidth) return;
    const target = activeIndex * tabWidth;
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
  }, [trackWidth, activeIndex, tabWidth, indicatorX]);

  return (
    <View
      className="bg-accent px-5 pb-5 overflow-hidden"
      style={{
        paddingTop: insets.top + 12,
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
          backgroundColor: COLORS.surface,
          opacity: 0.22,
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
          backgroundColor: COLORS.surface,
          opacity: 0.16,
        }}
      />

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 mr-3">
          <Text
            className="text-ink text-[28px] font-extrabold"
            style={{ lineHeight: 34 }}
            numberOfLines={1}
          >
            Công việc
          </Text>
          <Text className="text-ink text-xs mt-0.5" style={{ opacity: 0.75 }}>
            {TABS[activeIndex].subtitle}
          </Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-surface items-center justify-center overflow-hidden">
          <NotificationBellButton />
        </View>
      </View>

      <View
        className="rounded-full bg-accent-light"
        style={{ padding: TRACK_PADDING }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {/* Viên chọn trượt */}
        <Animated.View
          pointerEvents="none"
          className="bg-ink rounded-full"
          style={{
            position: "absolute",
            top: TRACK_PADDING,
            left: TRACK_PADDING,
            width: tabWidth,
            height: TAB_HEIGHT,
            opacity: trackWidth > 0 ? 1 : 0,
            transform: [{ translateX: indicatorX }],
          }}
        />
        <View className="flex-row">
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => onSwitchTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t.key }}
              className="flex-1 items-center justify-center"
              style={{ height: TAB_HEIGHT }}
            >
              <TabLabel label={t.label} active={tab === t.key} />
            </Pressable>
          ))}
        </View>
      </View>

      {tab === "available" ? (
        <DayFilterBar chips={dayChips} selected={day} onSelect={onSelectDay} />
      ) : null}
    </View>
  );
}
