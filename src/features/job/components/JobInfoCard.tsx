import { PressableScale } from "@/components/ui/PressableScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, ON_DARK, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { JobSummary } from "@/features/job/hooks/useJobDetail";
import { PAYMENT_STATUS_MAP } from "@/features/schedule/utils/scheduleStatus";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Image, Text, View } from "react-native";

type JobInfoCardProps = {
  summary: JobSummary;
  isPackage: boolean;
  customerName: string;
  customerAvatar: string | null;
  onDirections: () => void;
  map?: ReactNode;
};

function InfoLine({
  icon,
  label,
  value,
  last,
}: {
  icon: JobSummary["rows"][number]["icon"];
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start py-3 ${last ? "" : "border-b border-line"}`}
    >
      <View className="w-9 h-9 rounded-full bg-accent-light items-center justify-center mr-3">
        <Feather name={icon} size={15} color={COLORS.accentDark} />
      </View>
      <View className="flex-1">
        <Text className="text-ink-muted text-xs mb-0.5">{label}</Text>
        <Text className="text-ink text-sm font-semibold leading-5">
          {value}
        </Text>
      </View>
    </View>
  );
}

export function JobInfoCard({
  summary,
  isPackage,
  customerName,
  customerAvatar,
  onDirections,
  map,
}: JobInfoCardProps) {
  const payment = PAYMENT_STATUS_MAP[summary.payment];

  return (
    <View
      className="bg-surface border border-line p-4 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-canvas rounded-full px-3 py-1 mr-2 flex-shrink">
          <Text className="text-ink-muted text-xs" numberOfLines={1}>
            {summary.codeLine}
          </Text>
        </View>
        {isPackage && summary.countBadge ? (
          <View className="bg-warning-light rounded-full px-2.5 py-1">
            <Text className="text-warning-dark text-xs font-semibold">
              {summary.countBadge}
            </Text>
          </View>
        ) : (
          <StatusBadge status={summary.status} />
        )}
      </View>

      <Text className="text-ink text-xl font-extrabold mb-4">
        {summary.service}
      </Text>

      <View className="flex-row items-center justify-between bg-canvas border border-line rounded-2xl px-4 py-3.5 mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-ink-muted text-xs mb-0.5">
            {summary.priceCaption}
          </Text>
          <Text className="text-ink font-extrabold text-2xl" numberOfLines={1}>
            {summary.priceLabel}
          </Text>
        </View>
        {payment ? (
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: payment.bg }}
          >
            <Text className="text-xs font-bold" style={{ color: payment.text }}>
              {payment.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mb-1">
        {summary.rows.map((row, i) => (
          <InfoLine
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            last={i === summary.rows.length - 1 && !summary.hasCoordinates}
          />
        ))}
      </View>

      {map ??
        (summary.hasCoordinates ? (
          <PressableScale
            onPress={onDirections}
            accessibilityRole="button"
            accessibilityLabel="Chỉ đường"
            containerStyle={{ marginTop: 8, marginBottom: 4 }}
            className="flex-row items-center justify-center bg-ink rounded-full"
            style={{ height: 46 }}
          >
            <Feather name="navigation" size={15} color={ON_DARK.text} />
            <Text className="text-white text-xs ml-2" style={TYPE.button}>
              CHỈ ĐƯỜNG
            </Text>
          </PressableScale>
        ) : null)}

      {summary.noteRows.map((row) => (
        <View
          key={row.label}
          className="flex-row items-start bg-warning-light rounded-2xl p-3.5 mt-3"
        >
          <Feather
            name={row.icon}
            size={15}
            color={COLORS.warningDark}
            style={{ marginTop: 2 }}
          />
          <View className="flex-1 ml-2.5">
            <Text className="text-warning-dark text-xs font-bold mb-0.5">
              {row.label}
            </Text>
            <Text className="text-ink text-sm leading-5">{row.value}</Text>
          </View>
        </View>
      ))}

      <View className="flex-row items-center mt-4 pt-4 border-t border-line">
        {customerAvatar ? (
          <Image
            source={{ uri: customerAvatar }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-accent-light items-center justify-center">
            <Feather name="user" size={20} color={COLORS.accentDark} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-ink-muted text-xs mb-0.5">Khách đặt đơn</Text>
          <Text className="text-ink text-base font-extrabold" numberOfLines={1}>
            {customerName}
          </Text>
        </View>
      </View>
    </View>
  );
}
