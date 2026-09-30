import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

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
  spaced,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  spaced?: boolean;
}) {
  return (
    <View
      className={`flex-1 bg-surface border border-line p-4 ${spaced ? "ml-3" : ""}`}
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-accent-light items-center justify-center mr-2">
          <Feather name={icon} size={15} color={COLORS.accentDark} />
        </View>
        <Text className="text-ink-muted text-xs">{label}</Text>
      </View>
      <Text className="text-ink text-xl font-extrabold">{value}</Text>
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
    <View className="mb-5">
      <View className="flex-row items-end justify-between mb-4">
        <View>
          <Text className="text-ink text-xl font-extrabold">{title}</Text>
          <Text className="text-ink-muted text-sm mt-0.5">{dateLabel}</Text>
        </View>
        {count > 0 && (
          <View className="items-end">
            <Text className="text-ink-muted text-xs">Thu nhập ngày</Text>
            <Text className="text-ink text-base font-extrabold">
              {incomeLabel}
            </Text>
          </View>
        )}
      </View>

      {count > 0 && (
        <View className="flex-row">
          <Stat icon="briefcase" label="Số ca" value={String(count)} />
          <Stat icon="clock" label="Thời gian" value={hoursLabel} spaced />
        </View>
      )}
    </View>
  );
}
