import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCurrency } from "@/utils/format";

type Props = {
  selectedCount: number;
  selectedIncome: number | null;
  isClaiming: boolean;
  onClaim: () => void;
};

export function PackageClaimBar({
  selectedCount,
  selectedIncome,
  isClaiming,
  onClaim,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: 12 + insets.bottom }}
      className="flex-row items-center bg-white border-t border-[#F3F4F6] px-5 pt-3"
    >
      <View className="flex-1 mr-3">
        <Text className="text-[#9CA3AF] text-xs">
          {selectedCount > 0
            ? `Đã chọn ${selectedCount} buổi`
            : "Chưa chọn buổi nào"}
        </Text>
        <Text className="text-[#111827] font-bold text-base">
          {selectedCount > 0 ? (formatCurrency(selectedIncome) ?? "—") : "—"}
        </Text>
      </View>
      <Pressable
        onPress={onClaim}
        disabled={selectedCount === 0 || isClaiming}
        className={`rounded-xl px-6 py-3 ${
          selectedCount === 0 ? "bg-[#93C5FD]" : "bg-[#2563EB]"
        }`}
      >
        <Text className="text-white font-semibold text-base">
          {isClaiming
            ? "Đang xử lý..."
            : selectedCount > 0
              ? `Nhận ${selectedCount} buổi`
              : "Nhận việc"}
        </Text>
      </Pressable>
    </View>
  );
}
