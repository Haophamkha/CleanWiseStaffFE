import type { AvailableSort } from "@/features/schedule/types/Schedule";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text } from "react-native";

export function SortBar({
  value,
  onChange,
}: {
  value: AvailableSort;
  onChange: (s: AvailableSort) => void;
}) {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();
  const options: { key: AvailableSort; label: string }[] = [
    { key: "time", label: tr("Gần giờ nhất") },
    { key: "area", label: tr("Khu vực của tôi") },
    { key: "distance", label: tr("Gần vị trí hiện tại") },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12 }}
    >
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              marginRight: 8,
              paddingHorizontal: 14,
              height: 34,
              borderRadius: 17,
              justifyContent: "center",
              backgroundColor: active ? COLORS.primaryFill : COLORS.surface,
              borderWidth: 1,
              borderColor: active ? COLORS.primaryFill : COLORS.line,
            }}
          >
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: "700",
                color: active ? COLORS.white : COLORS.inkSoft,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
