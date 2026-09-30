import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { InfoRow } from "@/features/job/components/InfoRow";
import type { JobSummary } from "@/features/job/hooks/useJobDetail";
import { PAYMENT_STATUS_MAP } from "@/features/schedule/utils/scheduleStatus";
import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

type JobInfoCardProps = {
  summary: JobSummary;
  isPackage: boolean;
  customerName: string;
  customerAvatar: string | null;
  onDirections: () => void;
};

export function JobInfoCard({
  summary,
  isPackage,
  customerName,
  customerAvatar,
  onDirections,
}: JobInfoCardProps) {
  const payment = PAYMENT_STATUS_MAP[summary.payment];

  return (
    <View
      className="bg-surface border border-line p-4 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-ink-muted text-xs flex-1 mr-2" numberOfLines={1}>
          {summary.codeLine}
        </Text>
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

      <Text className="text-ink text-lg font-extrabold mb-3">
        {summary.service}
      </Text>

      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-ink-muted text-xs mb-0.5">
            {summary.priceCaption}
          </Text>
          <Text className="text-ink font-extrabold text-xl">
            {summary.priceLabel}
          </Text>
        </View>
        {payment ? (
          <View
            className="self-start px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: payment.bg }}
          >
            <Text className="text-xs font-bold" style={{ color: payment.text }}>
              {payment.label}
            </Text>
          </View>
        ) : null}
      </View>

      {summary.rows.map((row) => (
        <InfoRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
        />
      ))}

      {summary.hasCoordinates ? (
        <PrimaryButton
          label="Chỉ đường"
          icon="navigation"
          variant="soft"
          onPress={onDirections}
          style={{ marginTop: 4, marginBottom: 12 }}
        />
      ) : null}

      {summary.noteRows.map((row) => (
        <InfoRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
        />
      ))}

      <View className="flex-row items-center pt-4 border-t border-line">
        {customerAvatar ? (
          <Image
            source={{ uri: customerAvatar }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-accent-light items-center justify-center">
            <Feather name="user" size={18} color={COLORS.accentDark} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-ink-muted text-xs mb-0.5">Khách đặt đơn</Text>
          <Text className="text-ink text-sm font-bold" numberOfLines={1}>
            {customerName}
          </Text>
        </View>
      </View>
    </View>
  );
}
