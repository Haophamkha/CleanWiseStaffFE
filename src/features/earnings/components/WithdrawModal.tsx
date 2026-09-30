import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS, TYPE } from "@/constants/theme";
import { useWithdraw } from "@/features/earnings/hooks/useWithdraw";
import { Feather } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  walletBalance: number;
  onSuccess?: () => void;
};

export default function WithdrawModal({
  visible,
  onClose,
  walletBalance,
  onSuccess,
}: Props) {
  const insets = useSafeAreaInsets();
  const w = useWithdraw({ walletBalance, onClose, onSuccess });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={w.handleClose}
    >
      <TouchableWithoutFeedback onPress={w.handleClose}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: OVERLAY }}
        >
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View
                className="bg-surface px-5 pt-3"
                style={{
                  borderTopLeftRadius: RADIUS.sheet,
                  borderTopRightRadius: RADIUS.sheet,
                  paddingBottom: Math.max(insets.bottom, 16) + 16,
                }}
              >
                {/* Handle bar */}
                <View className="items-center mb-3">
                  <View className="w-10 h-1 rounded-full bg-line" />
                </View>

                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-ink text-xl font-extrabold">
                    Rút tiền ký quỹ
                  </Text>
                  <TouchableOpacity
                    onPress={w.handleClose}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Đóng"
                    className="items-center justify-center"
                    style={{ width: 44, height: 44 }}
                  >
                    <Feather name="x" size={22} color={COLORS.inkSoft} />
                  </TouchableOpacity>
                </View>

                {/* Số dư hiện tại */}
                <View className="bg-accent-light rounded-2xl px-4 py-3.5 mb-4">
                  <Text className="text-ink-soft text-xs">
                    Số dư ví hiện tại
                  </Text>
                  <Text className="text-ink text-xl font-extrabold mt-0.5">
                    {w.balanceText}
                  </Text>
                  <Text className="text-ink-muted text-xs mt-1 leading-4">
                    {w.hintText}
                  </Text>
                </View>

                {/* Input số tiền */}
                <View
                  className="flex-row items-center bg-surface border border-line rounded-2xl px-4"
                  style={{ minHeight: 56, borderWidth: 1.5 }}
                >
                  <TextInput
                    className="flex-1 text-ink text-xl font-extrabold py-3.5"
                    placeholder="0"
                    placeholderTextColor={COLORS.inkMuted}
                    keyboardType="number-pad"
                    value={w.amountDisplay}
                    onChangeText={w.handleChangeAmount}
                  />
                  <Text className="text-ink-soft ml-2" style={TYPE.label}>
                    đ
                  </Text>
                  <TouchableOpacity
                    onPress={w.handleMaxPress}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    className="ml-3 bg-ink rounded-full px-3.5 py-2"
                  >
                    <Text className="text-white text-xs" style={TYPE.label}>
                      Tối đa
                    </Text>
                  </TouchableOpacity>
                </View>

                {!!w.message && (
                  <View className="flex-row items-start bg-danger-light rounded-2xl p-3 mt-3">
                    <Feather
                      name="alert-circle"
                      size={15}
                      color={COLORS.danger}
                      style={{ marginTop: 1 }}
                    />
                    <Text className="flex-1 text-danger text-xs leading-4 ml-2">
                      {w.message}
                    </Text>
                  </View>
                )}

                <PrimaryButton
                  label="Xác nhận rút tiền"
                  variant="primary"
                  loading={w.isLoading}
                  disabled={!w.canSubmit}
                  onPress={w.handleSubmit}
                  style={{ marginTop: 20 }}
                />

                <Text className="text-ink-muted text-xs text-center mt-3">
                  Yêu cầu sẽ được admin xử lý, tiền sẽ về tài khoản ngân hàng
                  bạn đã đăng ký
                </Text>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
