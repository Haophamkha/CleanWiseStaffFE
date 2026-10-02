import { PressableScale } from "@/components/ui/PressableScale";
import { ON_DARK } from "@/constants/theme";
import type { DayChip } from "@/utils/dayChips";
import { ScrollView, Text } from "react-native";

/** Thiết kế để đặt trong header tone da (JobsHeader). */
export function DayFilterBar({
  chips,
  selected,
  onSelect,
}: {
  chips: DayChip[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-5"
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {chips.map((chip) => {
        const active = selected === chip.key;
        return (
          <PressableScale
            key={chip.key ?? "all"}
            onPress={() => onSelect(chip.key)}
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`min-w-[64px] px-3 py-2 rounded-2xl items-center justify-center border ${
              active ? "bg-ink border-ink" : "bg-canvas border-line"
            }`}
            style={{ minHeight: 48 }}
          >
            <Text
              className={`${
                chip.bottom ? "text-xs" : "text-sm font-semibold"
              } ${active ? "" : "text-ink-soft"}`}
              style={active ? { color: ON_DARK.textSoft } : undefined}
            >
              {chip.top}
            </Text>
            {chip.bottom ? (
              <Text
                className={`text-sm font-bold mt-0.5 ${active ? "text-white" : "text-ink"}`}
              >
                {chip.bottom}
              </Text>
            ) : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
