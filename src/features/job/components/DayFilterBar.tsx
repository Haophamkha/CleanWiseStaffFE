import { ON_DARK } from "@/constants/theme";
import type { DayChip } from "@/utils/dayChips";
import { Pressable, ScrollView, Text } from "react-native";

/** Thiết kế để đặt trong header đen (JobsHeader). */
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
          <Pressable
            key={chip.key ?? "all"}
            onPress={() => onSelect(chip.key)}
            className={`min-w-[64px] px-3 py-2 rounded-2xl items-center justify-center border ${
              active ? "bg-surface border-surface" : ""
            }`}
            style={[
              { minHeight: 48 },
              active
                ? undefined
                : {
                    backgroundColor: ON_DARK.surface,
                    borderColor: ON_DARK.border,
                  },
            ]}
          >
            <Text
              className={`${
                chip.bottom ? "text-xs" : "text-sm font-semibold"
              } ${active ? "text-ink-soft" : ""}`}
              style={active ? undefined : { color: ON_DARK.textSoft }}
            >
              {chip.top}
            </Text>
            {chip.bottom ? (
              <Text
                className={`text-sm font-bold mt-0.5 ${active ? "text-ink" : ""}`}
                style={active ? undefined : { color: ON_DARK.text }}
              >
                {chip.bottom}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
