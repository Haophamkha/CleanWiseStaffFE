import { COLORS } from "@/constants/theme";
import {
  AmountField,
  ErrorBox,
  QuickAmounts,
  SheetButton,
  WalletSheet,
} from "@/features/earnings/components/WalletSheet";
import { useWithdraw } from "@/features/earnings/hooks/useWithdraw";
import { formatVnd } from "@/features/earnings/utils/earningsFormat";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

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
  const w = useWithdraw({ walletBalance, onClose, onSuccess });

  /* ---------- kết quả ---------- */
  if (w.submitted) {
    const processing = w.status === "PROCESSING";
    const success = w.status === "SUCCESS";
    return (
      <WalletSheet visible={visible} onClose={w.handleClose}>
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          {processing ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: success
                  ? COLORS.successLight
                  : COLORS.dangerLight,
              }}
            >
              <Feather
                name={success ? "check" : "x"}
                size={30}
                color={success ? COLORS.success : COLORS.danger}
              />
            </View>
          )}
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.ink,
            }}
          >
            {processing
              ? "Đang xử lý yêu cầu rút"
              : success
                ? "Rút tiền thành công"
                : "Rút tiền thất bại"}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.primaryDark,
            }}
          >
            {formatVnd(w.submittedAmount)}
          </Text>
          {!!w.record && (
            <Text
              style={{ marginTop: 6, fontSize: 13, color: COLORS.inkMuted }}
            >
              {w.record.bank_name} {w.record.account_number_masked}
            </Text>
          )}
          <Text
            style={{
              marginTop: 12,
              marginBottom: 20,
              fontSize: 13,
              lineHeight: 19,
              textAlign: "center",
              color: COLORS.inkSoft,
            }}
          >
            {processing
              ? "Tiền sẽ về tài khoản trong ít phút. Bạn có thể đóng cửa sổ này, trạng thái sẽ cập nhật trong lịch sử giao dịch."
              : success
                ? "Tiền đã được chuyển về tài khoản ngân hàng của bạn."
                : w.record?.failure_reason ||
                  "Giao dịch không thành công. Tiền đã được hoàn vào ví."}
          </Text>
        </View>
        <SheetButton label="Đóng" onPress={w.handleClose} variant="soft" />
      </WalletSheet>
    );
  }

  /* ---------- form ---------- */
  return (
    <WalletSheet visible={visible} onClose={w.handleClose}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}>
        Rút tiền về tài khoản
      </Text>
      <Text style={{ fontSize: 13, marginTop: 4, color: COLORS.inkMuted }}>
        Số dư ví ký quỹ {w.balanceText}
      </Text>
      <Text
        style={{
          fontSize: 12,
          marginTop: 2,
          marginBottom: 16,
          color: COLORS.inkMuted,
        }}
      >
        {w.hintText}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 8,
          color: COLORS.inkSoft,
        }}
      >
        Tài khoản nhận tiền
      </Text>
      {w.methodsLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginBottom: 16 }}
        />
      ) : w.methods.length === 0 ? (
        <TouchableOpacity
          onPress={() => {
            w.handleClose();
            router.push("/payment-methods/add" as any);
          }}
          activeOpacity={0.8}
          style={{
            padding: 14,
            marginBottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: COLORS.primaryBorder,
            backgroundColor: COLORS.primarySoft,
          }}
        >
          <Text style={{ fontWeight: "700", color: COLORS.primaryDark }}>
            + Thêm tài khoản ngân hàng
          </Text>
          <Text style={{ fontSize: 12, marginTop: 2, color: COLORS.inkSoft }}>
            Bạn cần có tài khoản ngân hàng để rút tiền.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginBottom: 16, gap: 8 }}>
          {w.methods.map((m) => {
            const active = w.selected?.id === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                disabled={w.uncertain}
                onPress={() => w.selectMethod(m.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: active ? COLORS.primary : COLORS.line,
                  backgroundColor: active ? COLORS.primarySoft : COLORS.surface,
                  opacity: w.uncertain && !active ? 0.5 : 1,
                }}
              >
                <Feather
                  name="credit-card"
                  size={18}
                  color={COLORS.primaryDark}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontWeight: "700", color: COLORS.ink }}>
                    {m.bank_name} {m.account_number_masked}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: COLORS.inkMuted }}
                    numberOfLines={1}
                  >
                    {m.account_holder_name}
                    {m.is_default ? " · Mặc định" : ""}
                  </Text>
                </View>
                {active && (
                  <Feather
                    name="check-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <AmountField
        value={w.amountDisplay}
        onChange={w.handleChangeAmount}
        editable={!w.uncertain}
      />
      <QuickAmounts
        amounts={w.quickAmounts}
        onPick={(v) => w.handleChangeAmount(String(v))}
        format={formatVnd}
        disabled={w.uncertain}
      />
      <TouchableOpacity
        onPress={w.handleMaxPress}
        disabled={w.uncertain}
        style={{ marginTop: -8, marginBottom: 16 }}
      >
        <Text
          style={{ fontSize: 13, fontWeight: "700", color: COLORS.primaryDark }}
        >
          Rút tối đa
        </Text>
      </TouchableOpacity>

      <ErrorBox text={w.message} />

      <SheetButton
        label={w.uncertain ? "Gửi lại" : "Gửi yêu cầu"}
        onPress={w.handleSubmit}
        loading={w.isLoading}
        disabled={!w.canSubmit && !w.uncertain}
      />
    </WalletSheet>
  );
}
