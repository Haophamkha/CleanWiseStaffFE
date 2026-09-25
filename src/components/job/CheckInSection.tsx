import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getCheckInAvailability } from "@/utils/scheduleStatus";

type Props = {
  scheduledStart: string;
  addressHint?: string | null;
  loading: boolean;
  onCheckIn: () => void;
};

export function CheckInSection({
  scheduledStart,
  addressHint,
  loading,
  onCheckIn,
}: Props) {
  const availability = getCheckInAvailability(scheduledStart);

  if (availability.canStart) {
    return (
      <PrimaryButton
        label="Bắt đầu công việc"
        subtitle={
          addressHint ? `Tại ${addressHint}` : "Chạm để bắt đầu buổi làm"
        }
        loading={loading}
        loadingLabel="Đang xử lý..."
        icon="play"
        onPress={onCheckIn}
        disabled={loading}
        style={{ marginBottom: 12 }}
      />
    );
  }

  return (
    <View className="flex-row items-center bg-[#FEF3C7] rounded-xl px-4 py-3.5 mb-3">
      <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
        <Feather name="clock" size={16} color="#B45309" />
      </View>
      <View className="flex-1">
        <Text className="text-[#92400E] font-semibold text-sm">
          Chưa đến giờ bắt đầu
        </Text>
        <Text className="text-[#92400E] text-xs mt-0.5">
          Có thể bắt đầu từ {availability.availableAtLabel}
        </Text>
      </View>
    </View>
  );
}
