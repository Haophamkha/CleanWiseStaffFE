import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  canCancel: boolean;
  showForm: boolean;
  reason: string;
  isCancelling: boolean;
  onChangeReason: (v: string) => void;
  onToggleForm: (show: boolean) => void;
  onConfirmCancel: () => void;
};

export function CancelSection({
  canCancel,
  showForm,
  reason,
  isCancelling,
  onChangeReason,
  onToggleForm,
  onConfirmCancel,
}: Props) {
  if (!canCancel) {
    return (
      <View className="bg-[#FEF3C7] rounded-xl p-4">
        <Text className="text-[#92400E] text-sm font-medium mb-1">
          Không thể tự hủy
        </Text>
        <Text className="text-[#92400E] text-xs">
          Chỉ còn dưới 6 tiếng trước giờ làm. Vui lòng liên hệ quản trị viên nếu
          cần hỗ trợ.
        </Text>
      </View>
    );
  }

  if (!showForm) {
    return (
      <Pressable
        onPress={() => onToggleForm(true)}
        className="border border-[#DC2626] rounded-xl py-4 items-center"
      >
        <Text className="text-[#DC2626] font-semibold text-base">
          Hủy nhận việc
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 border border-[#F3F4F6]">
      <Text className="text-[#111827] font-medium text-sm mb-2">Lý do hủy</Text>
      <TextInput
        value={reason}
        onChangeText={onChangeReason}
        placeholder="Nhập lý do hủy nhận việc..."
        multiline
        className="border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#111827] mb-3"
        style={{ minHeight: 80, textAlignVertical: "top" }}
      />
      <Pressable
        onPress={onConfirmCancel}
        disabled={isCancelling}
        className="bg-[#DC2626] rounded-xl py-3 items-center mb-2"
      >
        <Text className="text-white font-semibold text-sm">
          {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onToggleForm(false)}
        className="items-center py-2"
      >
        <Text className="text-[#6B7280] text-sm">Đóng</Text>
      </Pressable>
    </View>
  );
}
