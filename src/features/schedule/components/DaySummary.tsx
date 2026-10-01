import { COLORS, ON_DARK, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

type FeatherName = ComponentProps<typeof Feather>["name"];

type DaySummaryProps = {
  title: string;
  dateLabel: string;
  count: number;
  hoursLabel: string;
  incomeLabel: string;
};

function Stat({
  icon,
  label,
  value,
  highlight,
  flex = 1,
}: {
  icon: FeatherName;
  label: string;
  value: string;
  highlight?: boolean;
  flex?: number;
}) {
  return (
    <View
      className={`p-3.5 ${
        highlight ? "bg-primary" : "bg-surface border border-line"
      }`}
      style={[{ flex, borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View
        className={`w-8 h-8 rounded-full items-center justify-center ${
          highlight ? "" : "bg-accent-light"
        }`}
        style={highlight ? { backgroundColor: ON_DARK.surface } : undefined}
      >
        <Feather
          name={icon}
          size={15}
          color={highlight ? ON_DARK.text : COLORS.ink}
        />
      </View>
      <Text
        className={`font-extrabold mt-3 ${highlight ? "text-xl" : "text-2xl"}`}
        style={{ color: highlight ? ON_DARK.text : COLORS.ink }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text
        className="text-xs mt-0.5"
        style={{ color: highlight ? ON_DARK.textSoft : COLORS.inkSoft }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function DaySummary({
  title,
  dateLabel,
  count,
  hoursLabel,
  incomeLabel,
}: DaySummaryProps) {
  return (
    <View className="mb-6">
      <View className={count > 0 ? "mb-4" : ""}>
        <Text className="text-ink text-2xl font-extrabold">{title}</Text>
        <Text className="text-ink-muted text-sm mt-0.5">{dateLabel}</Text>
      </View>

      {count > 0 && (
        <View className="flex-row" style={{ gap: 10 }}>
          <Stat icon="briefcase" label="ca làm" value={String(count)} />
          <Stat icon="clock" label="thời gian" value={hoursLabel} />
          <Stat
            icon="trending-up"
            label="thu nhập ngày"
            value={incomeLabel}
            highlight
            flex={1.6}
          />
        </View>
      )}
    </View>
  );
}
