import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { useGetMyComplaintsQuery } from "@/features/complaint/api/complaintApi";
import { ComplaintSheet } from "@/features/complaint/components/ComplaintSheet";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

type Props = { bookingId: number; scheduleId: number };

export function ComplaintAction({ bookingId, scheduleId }: Props) {
  const [open, setOpen] = useState(false);
  const { data } = useGetMyComplaintsQuery({ schedule: scheduleId });
  const active = data?.find((c) => c.status !== "CANCELLED");

  return (
    <FadeInView delay={150}>
      <PressableScale
        onPress={() =>
          active
            ? router.push(`/complaints/${active.id}` as any)
            : setOpen(true)
        }
        accessibilityRole="button"
        accessibilityLabel="Báo sự cố"
        containerStyle={{ marginBottom: 12 }}
        className="flex-row items-center bg-surface border border-line px-4 py-3"
        style={[{ borderRadius: RADIUS.card, minHeight: 64 }, SHADOWS.card]}
      >
        <View className="w-11 h-11 rounded-full bg-danger-light items-center justify-center mr-3">
          <Feather
            name={active ? "check-circle" : "alert-circle"}
            size={20}
            color={COLORS.danger}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ink text-sm font-extrabold">
            {active ? "Đã gửi khiếu nại" : "Báo sự cố / Khiếu nại"}
          </Text>
          <Text className="text-ink-muted text-xs mt-0.5">
            {active
              ? `Trạng thái: ${active.status_label}`
              : "Khách không trả tiền, sự cố khi làm việc..."}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={COLORS.ink} />
      </PressableScale>

      <ComplaintSheet
        visible={open}
        bookingId={bookingId}
        scheduleId={scheduleId}
        onClose={() => setOpen(false)}
      />
    </FadeInView>
  );
}
