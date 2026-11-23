import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import type { AvailableSort } from "@/features/schedule/types/Schedule";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

export function SortBar({
  value,
  onChange,
  onEnableLocation,
  locating,
}: {
  value: AvailableSort;
  onChange: (s: AvailableSort) => void;
  onEnableLocation?: () => void;
  locating?: boolean;
}) {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();
  const options: { key: AvailableSort; label: string }[] = [
    { key: "time", label: tr("Sớm nhất") },
    { key: "distance", label: tr("Gần tôi") },
    { key: "area", label: tr("Khu vực của tôi") },
  ];

  return (
    <View className="flex-row items-center pt-3">
      <ScrollView style={{ flex: 1 }}
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
      {onEnableLocation ? (
        <Pressable
          onPress={onEnableLocation}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel={tr("B\u1eadt v\u1ecb tr\u00ed \u0111\u1ec3 xem kho\u1ea3ng c\u00e1ch")}
          className="mx-5 h-[34px] w-[34px] items-center justify-center rounded-full border border-line bg-surface"
        >
          {locating ? (
            <ActivityIndicator size="small" color={COLORS.accentDark} />
          ) : (
            <Feather name="navigation" size={14} color={COLORS.accentDark} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
