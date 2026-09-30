import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { ON_DARK, RADIUS, TYPE } from "@/constants/theme";
import { DayFilterBar } from "@/features/job/components/DayFilterBar";
import type { Tab } from "@/features/job/types/jobNav";
import type { DayChip } from "@/utils/dayChips";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: { key: Tab; label: string }[] = [
  { key: "available", label: "Khả dụng" },
  { key: "mine", label: "Của tôi" },
];

type JobsHeaderProps = {
  tab: Tab;
  onSwitchTab: (tab: Tab) => void;
  dayChips: DayChip[];
  day: string | null;
  onSelectDay: (key: string | null) => void;
};

export function JobsHeader({
  tab,
  onSwitchTab,
  dayChips,
  day,
  onSelectDay,
}: JobsHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-ink px-5 pb-5"
      style={{
        paddingTop: insets.top + 12,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="flex-1 mr-3 text-[28px] font-extrabold"
          style={{ color: ON_DARK.text, lineHeight: 34 }}
          numberOfLines={1}
        >
          Công việc
        </Text>
        <View className="w-11 h-11 rounded-full bg-surface border border-line items-center justify-center overflow-hidden">
          <NotificationBellButton />
        </View>
      </View>

      <View
        className="flex-row rounded-full p-1"
        style={{ backgroundColor: ON_DARK.surface }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onSwitchTab(t.key)}
              className={`flex-1 items-center justify-center rounded-full ${
                active ? "bg-surface" : ""
              }`}
              style={{ height: 44 }}
            >
              <Text
                className={`text-xs ${active ? "text-ink" : ""}`}
                style={[
                  TYPE.label,
                  active ? undefined : { color: ON_DARK.textSoft },
                ]}
              >
                {t.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "available" ? (
        <DayFilterBar chips={dayChips} selected={day} onSelect={onSelectDay} />
      ) : null}
    </View>
  );
}
