import { COLORS } from "@/constants/theme";
import type { DayChip } from "@/utils/dayChips";
import { Pressable, ScrollView, Text, View } from "react-native";

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
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {chips.map((chip) => {
        const active = selected === chip.key;
        return (
          <Pressable
            key={chip.key ?? "all"}
            onPress={() => onSelect(chip.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ marginRight: 22, paddingTop: 8, alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: active ? "800" : "500",
                color: active ? COLORS.ink : COLORS.inkSoft,
              }}
            >
              {chip.top}
            </Text>
            <Text
              style={{
                fontSize: 11,
                marginTop: 1,
                color: active ? COLORS.ink : COLORS.inkMuted,
              }}
            >
              {chip.bottom || "\u00A0"}
            </Text>
            <View
              style={{
                height: 3,
                alignSelf: "stretch",
                borderRadius: 2,
                marginTop: 6,
                backgroundColor: active ? COLORS.ink : "transparent",
              }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
