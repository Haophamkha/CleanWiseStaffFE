import { Pressable, ScrollView, Text } from "react-native";

import type { DayChip } from "@/utils/dayChips";

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
            className={`min-w-[64px] px-3 py-2 rounded-xl items-center justify-center border ${
              active
                ? "bg-[#2563EB] border-[#2563EB]"
                : "bg-white border-[#E5E7EB]"
            }`}
          >
            <Text
              className={`${
                chip.bottom ? "text-xs" : "text-sm font-semibold"
              } ${active ? "text-white" : "text-[#6B7280]"}`}
            >
              {chip.top}
            </Text>
            {chip.bottom ? (
              <Text
                className={`text-sm font-bold mt-0.5 ${
                  active ? "text-white" : "text-[#111827]"
                }`}
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
