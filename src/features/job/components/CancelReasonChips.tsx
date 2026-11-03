import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

function getLocalizedQuickReasons(translateText = defaultTranslate) {
  return [
    translateText("Bận việc đột xuất"),
    translateText("Sức khỏe không tốt"),
    translateText("Trùng lịch khác"),
  ];
}

type CancelReasonChipsProps = {
  value: string;
  onSelect: (reason: string) => void;
};

/** Gợi ý nhanh lý do hủy, chạm để điền vào ô nhập. */
export function CancelReasonChips({ value, onSelect }: CancelReasonChipsProps) {
  const { t: tr } = useTranslation();

  return (
    <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
      {getLocalizedQuickReasons(tr).map((r) => {
        const active = value.trim() === r;
        return (
          <Pressable
            key={r}
            onPress={() => onSelect(r)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`rounded-full px-3.5 justify-center border ${
              active ? "bg-ink-panel border-ink" : "bg-surface border-line"
            }`}
            style={{ minHeight: 36 }}
          >
            <Text
              className={`text-xs font-semibold ${
                active ? "text-white" : "text-ink-soft"
              }`}
            >
              {r}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
