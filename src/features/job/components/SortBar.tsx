import type { AvailableSort } from "@/features/schedule/types/Schedule";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SortBar({
  value,
  onChange,
}: {
  value: AvailableSort;
  onChange: (s: AvailableSort) => void;
}) {
  const { t: tr } = useTranslation();
  const options: { key: AvailableSort; label: string }[] = [
    { key: "time", label: tr("Sớm nhất") },
    { key: "distance", label: tr("Gần tôi") },
    { key: "area", label: tr("Khu vực của tôi") },
  ];

  return (
    <View className="pt-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", gap: 8, paddingHorizontal: 20 }}
      >
        <Text className="text-ink-muted text-xs font-semibold">{tr("Sắp xếp")}</Text>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => onChange(o.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={`min-h-[34px] justify-center rounded-full border px-3 py-1 ${active ? "border-ink-panel bg-ink-panel" : "border-line bg-surface"}`}
            >
              <Text className={`text-xs font-semibold ${active ? "text-white" : "text-ink"}`}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
