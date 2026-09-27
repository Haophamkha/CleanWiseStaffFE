import { useWithdrawWalletMutation } from "@/services/earningsApi";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const MIN_ESCROW_BALANCE = 400_000;

const formatVnd = (value: number) => {
  const digits = Math.round(Math.abs(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 ? "-" : ""}${digits}đ`;
};

// Chỉ giữ số, bỏ mọi ký tự khác (dấu chấm phân cách, chữ...)
const parseAmountInput = (raw: string) => {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

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
  const [rawInput, setRawInput] = useState("");
  const [withdrawWallet, { isLoading }] = useWithdrawWalletMutation();
  const [errorText, setErrorText] = useState<string | null>(null);

  const amount = parseAmountInput(rawInput);
  const maxWithdrawable = Math.max(walletBalance - MIN_ESCROW_BALANCE, 0);

  const validationError =
    amount <= 0
      ? null // chưa nhập gì thì không cần báo lỗi ngay
      : amount > maxWithdrawable
        ? `Số dư sau khi rút phải còn lại tối thiểu ${formatVnd(
            MIN_ESCROW_BALANCE,
          )}. Bạn chỉ có thể rút tối đa ${formatVnd(maxWithdrawable)}.`
        : null;

  const canSubmit = amount > 0 && !validationError && !isLoading;

  const handleClose = () => {
    setRawInput("");
    setErrorText(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorText(null);
    try {
      await withdrawWallet({ amount }).unwrap();
      setRawInput("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      // BE trả lỗi validation dạng { amount: [...] } hoặc { message: "..." }
      const backendMsg =
        err?.data?.amount?.[0] ??
        err?.data?.message ??
        "Không thể tạo yêu cầu rút tiền, vui lòng thử lại.";
      setErrorText(backendMsg);
    }
  };

  const handleMaxPress = () => {
    setRawInput(String(maxWithdrawable));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(17,24,39,0.5)" }}
        >
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
                {/* Handle bar */}
                <View className="items-center mb-4">
                  <View className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
                </View>

                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-[#111827] text-lg font-bold">
                    Rút tiền ký quỹ
                  </Text>
                  <TouchableOpacity onPress={handleClose} hitSlop={8}>
                    <Feather name="x" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Số dư hiện tại */}
                <View className="bg-[#F8F9FC] rounded-2xl px-4 py-3 mb-4">
                  <Text className="text-[#6B7280] text-xs">
                    Số dư ví hiện tại
                  </Text>
                  <Text className="text-[#111827] text-lg font-bold mt-0.5">
                    {formatVnd(walletBalance)}
                  </Text>
                  <Text className="text-[#9CA3AF] text-xs mt-1">
                    Ví ký quỹ phải giữ tối thiểu {formatVnd(MIN_ESCROW_BALANCE)}
                    , bạn có thể rút tối đa {formatVnd(maxWithdrawable)}
                  </Text>
                </View>

                {/* Input số tiền */}
                <View className="flex-row items-center bg-[#F8F9FC] rounded-2xl px-4 border border-[#E5E7EB]">
                  <TextInput
                    className="flex-1 text-[#111827] text-xl font-bold py-3.5"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="number-pad"
                    value={
                      rawInput ? Number(rawInput).toLocaleString("vi-VN") : ""
                    }
                    onChangeText={(text) =>
                      setRawInput(String(parseAmountInput(text)))
                    }
                  />
                  <Text className="text-[#6B7280] font-semibold ml-2">đ</Text>
                  <TouchableOpacity
                    onPress={handleMaxPress}
                    className="ml-3 bg-[#DBEAFE] rounded-lg px-3 py-1.5"
                  >
                    <Text className="text-[#2563EB] text-xs font-bold">
                      Tối đa
                    </Text>
                  </TouchableOpacity>
                </View>

                {(validationError || errorText) && (
                  <Text className="text-[#DC2626] text-xs mt-2 px-1">
                    {validationError ?? errorText}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.85}
                  className="rounded-2xl py-4 items-center mt-5"
                  style={{
                    backgroundColor: canSubmit ? "#2563EB" : "#D1D5DB",
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-[15px]">
                      Xác nhận rút tiền
                    </Text>
                  )}
                </TouchableOpacity>

                <Text className="text-[#9CA3AF] text-xs text-center mt-3">
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
