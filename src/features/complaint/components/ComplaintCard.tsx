import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { PressableScale } from "@/components/ui/PressableScale";
import { RADIUS } from "@/constants/theme";
import type { useGetMyComplaintsQuery } from "@/features/complaint/api/complaintApi";
import { ComplaintStatusBadge } from "@/features/complaint/components/ComplaintStatusBadge";
import { formatDateTime } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Item = NonNullable<ReturnType<typeof useGetMyComplaintsQuery>["data"]>[number];

export function ComplaintCard({ item, onPress }: { item: Item; onPress: () => void }) {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const accent =
    (
      {
        PENDING: COLORS.warning,
        IN_REVIEW: COLORS.info,
        RESOLVED: COLORS.success,
        REJECTED: COLORS.danger,
      } as Record<string, string>
    )[item.status] ?? COLORS.inkMuted;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      containerStyle={{ marginBottom: 14 }}
      className="bg-surface border border-line"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          backgroundColor: accent,
          borderTopLeftRadius: RADIUS.card,
          borderBottomLeftRadius: RADIUS.card,
        }}
      />
      <View style={{ paddingVertical: 14, paddingLeft: 20, paddingRight: 16 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-center pr-3">
            <View className="w-11 h-11 rounded-2xl bg-danger-light items-center justify-center mr-3">
              <Feather name="alert-circle" size={20} color={COLORS.danger} />
            </View>
            <View className="flex-1">
              <Text
                className="text-ink text-[15px] font-extrabold leading-5"
                numberOfLines={2}
              >
                {item.issue_type_name}
              </Text>
              <Text
                selectable
                className="text-ink-muted text-[11px] mt-0.5"
                numberOfLines={1}
              >
                {item.code ?? `#${item.id}`}
              </Text>
            </View>
          </View>
          <ComplaintStatusBadge status={item.status} label={item.status_label} />
        </View>

        <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
          <View className="flex-row items-center bg-accent-light rounded-full px-2.5 py-1">
            <Feather name="file-text" size={11} color={COLORS.accentDark} />
            <Text className="text-accent-dark text-[11px] font-bold ml-1.5" numberOfLines={1}>
              {tr("\u0110\u01a1n")}{" "}{item.booking_code}
            </Text>
          </View>
          <View className="flex-row items-center bg-accent-light rounded-full px-2.5 py-1">
            <Feather name="layers" size={11} color={COLORS.accentDark} />
            <Text className="text-accent-dark text-[11px] font-bold ml-1.5" numberOfLines={1}>
              {item.stage_label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-line">
          <View className="flex-row items-center">
            <Feather name="clock" size={13} color={COLORS.inkMuted} />
            <Text className="text-ink-muted text-[11px] ml-1.5">
              {formatDateTime(item.created_at, tr)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-primary text-xs font-bold mr-1">
              {tr("Xem chi ti\u1ebft")}
            </Text>
            <Feather name="arrow-right" size={14} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}