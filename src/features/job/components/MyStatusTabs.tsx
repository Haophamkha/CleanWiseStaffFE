import { PressableScale } from "@/components/ui/PressableScale";
import type { MyJobsTab } from "@/features/schedule/types/Schedule";
import { ScrollView, Text } from "react-native";

const TABS: { key: MyJobsTab; label: string }[] = [
  { key: "upcoming", label: "Sắp tới" },
  { key: "today", label: "Hôm nay" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export function MyStatusTabs({
  value,
  onChange,
}: {
  value: MyJobsTab;
  onChange: (tab: MyJobsTab) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-5"
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <PressableScale
            key={t.key}
            onPress={() => onChange(t.key)}
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`px-4 rounded-full items-center justify-center border ${
              active ? "bg-ink border-ink" : "bg-canvas border-line"
            }`}
            style={{ height: 40 }}
          >
            <Text
              className={`text-sm font-bold ${
                active ? "text-white" : "text-ink-soft"
              }`}
            >
              {t.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
