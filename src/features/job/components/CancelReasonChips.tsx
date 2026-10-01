import { Pressable, Text, View } from "react-native";

const QUICK_REASONS = [
  "Bận việc đột xuất",
  "Sức khỏe không tốt",
  "Trùng lịch khác",
];

type CancelReasonChipsProps = {
  value: string;
  onSelect: (reason: string) => void;
};

/** Gợi ý nhanh lý do hủy, chạm để điền vào ô nhập. */
export function CancelReasonChips({ value, onSelect }: CancelReasonChipsProps) {
  return (
    <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
      {QUICK_REASONS.map((r) => {
        const active = value.trim() === r;
        return (
          <Pressable
            key={r}
            onPress={() => onSelect(r)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`rounded-full px-3.5 justify-center border ${
              active ? "bg-ink border-ink" : "bg-surface border-line"
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
