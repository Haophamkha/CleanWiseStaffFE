import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import type { MyJobsTab } from "@/features/schedule/types/Schedule";
import { Pressable, ScrollView, Text, View } from "react-native";

function getLocalizedTabs(): { key: MyJobsTab; label: string }[] {
  return [
    { key: "today", label: tr("Hôm nay") },
    { key: "upcoming", label: tr("Sắp tới") },
    { key: "completed", label: tr("Hoàn thành") },
    { key: "cancelled", label: tr("Đã hủy") },
  ];
}

export function MyStatusTabs({
  value,
  onChange,
  counts,
}: {
  value: MyJobsTab;
  onChange: (tab: MyJobsTab) => void;
  counts?: Partial<Record<MyJobsTab, number>>;
}) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-5"
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {getLocalizedTabs().map((t) => {
        const active = value === t.key;
        const count = counts?.[t.key] ?? 0;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ marginRight: 24, paddingTop: 8 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: active ? "800" : "500",
                color: active ? COLORS.ink : COLORS.inkSoft,
              }}
            >
              {t.label}
              {count > 0 ? ` (${count})` : ""}
            </Text>
            <View
              style={{
                height: 3,
                borderRadius: 2,
                marginTop: 8,
                backgroundColor: active ? COLORS.ink : "transparent",
              }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
