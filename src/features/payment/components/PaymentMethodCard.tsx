import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  method: PaymentMethod;
  disabled: boolean;
  onSetDefault: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
};

export default function PaymentMethodCard({
  method,
  disabled,
  onSetDefault,
  onDelete,
}: Props) {
  const verified = method.verification_status === "VERIFIED";
  const failed = method.verification_status === "FAILED";
  const statusLabel = verified
    ? "Đã xác minh"
    : failed
      ? "Xác minh thất bại"
      : "Chưa xác minh";
  const statusBackground = verified
    ? COLORS.successLight
    : failed
      ? COLORS.dangerLight
      : COLORS.warningLight;
  const statusColor = verified
    ? COLORS.success
    : failed
      ? COLORS.danger
      : COLORS.warningDark;

  return (
    <View
      className="bg-surface border border-line p-5 mb-3"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-2xl bg-accent-light items-center justify-center mr-3">
          <Feather name="credit-card" size={21} color={COLORS.ink} />
        </View>
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center">
            <Text className="text-ink text-base font-extrabold mr-2">
              {method.display_name || method.bank_name}
            </Text>
            {method.is_default && (
              <View className="bg-ink rounded-full px-2.5 py-1">
                <Text className="text-white text-[11px]" style={TYPE.label}>
                  Mặc định
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-ink text-[15px] mt-1"
            style={{ fontWeight: "700", letterSpacing: 1 }}
          >
            {method.account_number_masked}
          </Text>
          <Text className="text-ink-soft text-sm mt-1" numberOfLines={1}>
            {method.account_holder_name}
          </Text>
          <View className="flex-row mt-3">
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: statusBackground }}
            >
              <Text
                className="text-xs"
                style={[TYPE.label, { color: statusColor }]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row border-t border-line mt-4 pt-2">
        {!method.is_default && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center"
            style={{ minHeight: 44 }}
            onPress={() => onSetDefault(method)}
            disabled={disabled}
          >
            <Feather name="check-circle" size={16} color={COLORS.ink} />
            <Text className="text-ink ml-2" style={TYPE.label}>
              Đặt mặc định
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`${
            method.is_default ? "flex-1" : "flex-1 border-l border-line"
          } flex-row items-center justify-center`}
          style={{ minHeight: 44 }}
          onPress={() => onDelete(method)}
          disabled={disabled}
        >
          <Feather name="trash-2" size={16} color={COLORS.danger} />
          <Text className="text-danger ml-2" style={TYPE.label}>
            Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
