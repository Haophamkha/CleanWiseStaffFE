import { COLORS, ON_DARK, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

type FeatherName = ComponentProps<typeof Feather>["name"];

type TodaySummaryProps = {
  count: number;
  hours: string;
  income: string;
};

function StatBox({
  icon,
  value,
  label,
  highlight,
  flex = 1,
}: {
  icon: FeatherName;
  value: string | number;
  label: string;
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

// Kéo đè lên header (marginTop âm) để tạo chiều sâu
export function TodaySummary({ count, hours, income }: TodaySummaryProps) {
  return (
    <View className="flex-row px-5 -mt-14" style={{ gap: 10 }}>
      <StatBox icon="briefcase" value={count} label="công việc" />
      <StatBox icon="clock" value={hours} label="giờ làm" />
      <StatBox
        icon="trending-up"
        value={income}
        label="thu nhập dự kiến"
        highlight
        flex={1.6}
      />
    </View>
  );
}
