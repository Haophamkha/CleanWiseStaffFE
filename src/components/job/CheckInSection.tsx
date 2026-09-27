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

  // THÊM: quá hạn check-in (trễ hơn CHECKIN_LATE_MINUTES so với giờ hẹn) —
  // khác với "chưa tới giờ", trường hợp này không còn availableAtLabel
  // để hiện, và worker cũng không tự check-in được nữa (BE đã chặn).
  if (availability.reason === "too_late") {
    return (
      <View className="flex-row items-center bg-[#FEE2E2] rounded-xl px-4 py-3.5 mb-3">
        <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
          <Feather name="alert-triangle" size={16} color="#B91C1C" />
        </View>
        <View className="flex-1">
          <Text className="text-[#B91C1C] font-semibold text-sm">
            Đã quá giờ check-in
          </Text>
          <Text className="text-[#B91C1C] text-xs mt-0.5">
            Vui lòng liên hệ CleanWise để được hỗ trợ.
          </Text>
        </View>
      </View>
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
