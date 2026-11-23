// DaySummary compact
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RADIUS } from "@/constants/theme";
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
  const { COLORS } = useAppTheme();

  return (
    <View className="items-center justify-center px-2" style={{ flex }}>
      <View className="flex-row items-center" style={{ gap: 5 }}>
        <Feather
          name={icon}
          size={13}
          color={highlight ? COLORS.primary : COLORS.inkMuted}
        />
        <Text
          className="text-base font-extrabold"
          style={{ color: highlight ? COLORS.primary : COLORS.ink }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
      <Text
        className="text-[11px] mt-0.5"
        style={{ color: COLORS.inkSoft }}
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
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  return (
    <View className="mb-4">
      <View className={`flex-row items-baseline ${count > 0 ? "mb-3" : ""}`} style={{ gap: 8 }}>
        <Text className="text-ink text-xl font-extrabold">{title}</Text>
        <Text className="text-ink-muted text-sm">{"\u00B7"} {dateLabel}</Text>
      </View>

      {count > 0 && (
        <View
          className="flex-row items-center bg-surface border border-line py-3"
          style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
        >
          <Stat icon="briefcase" label={tr("ca l\u00e0m")} value={String(count)} />
          <View style={{ width: 1, height: 28, backgroundColor: COLORS.line }} />
          <Stat icon="clock" label={tr("th\u1eddi gian")} value={hoursLabel} />
          <View style={{ width: 1, height: 28, backgroundColor: COLORS.line }} />
          <Stat
            icon="trending-up"
            label={tr("thu nh\u1eadp ng\u00e0y")}
            value={incomeLabel}
            highlight
            flex={1.5}
          />
        </View>
      )}
    </View>
  );
}