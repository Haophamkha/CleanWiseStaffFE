import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export type ComplaintTab = "complaints" | "discipline";

export function ComplaintTabs({ value, onChange }: {
  value: ComplaintTab;
  onChange: (tab: ComplaintTab) => void;
}) {
  const { t } = useTranslation();
  const tabs = [
    { key: "complaints", label: t("Khiếu nại") },
    { key: "discipline", label: t("Điểm & xử lý") },
  ] as const;

  return (
    <View className="flex-row border-b border-line mx-4 mt-3">
      {tabs.map(({ key, label }) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(key)}
            className="flex-1 min-h-11 justify-end items-stretch"
          >
            <Text className={`text-center text-sm px-2 pb-2 ${selected ? "text-ink font-extrabold" : "text-ink-soft font-medium"}`}>
              {label}
            </Text>
            <View className={`h-[3px] rounded-full ${selected ? "bg-ink" : "bg-transparent"}`} />
          </Pressable>
        );
      })}
    </View>
  );
}
