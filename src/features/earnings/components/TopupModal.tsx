import { COLORS } from "@/constants/theme";
import {
    AmountField,
    ErrorBox,
    QuickAmounts,
    SheetButton,
    WalletSheet,
} from "@/features/earnings/components/WalletSheet";
import { useTopup } from "@/features/earnings/hooks/useTopup";
import { TOPUP_MAX, TOPUP_MIN } from "@/features/earnings/hooks/walletHelpers";
import { formatVnd } from "@/features/earnings/utils/earningsFormat";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

type Props = { visible: boolean; onClose: () => void };

export default function TopupModal({ visible, onClose }: Props) {
  const t = useTopup(onClose);

  if (t.submitted) {
    const waiting = !t.finished;
    const success = t.status === "SUCCESS";
    return (
      <WalletSheet visible={visible} onClose={t.close}>
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          {waiting ? (
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
            {waiting
              ? "Đang chờ thanh toán"
              : success
                ? "Nạp ký quỹ thành công"
                : "Liên kết đã hết hạn hoặc bị hủy"}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.primaryDark,
            }}
          >
            {formatVnd(t.amountValue)}
          </Text>
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
            {waiting
              ? "Hoàn tất chuyển khoản ở trang thanh toán. Sau khi thanh toán, quay lại app, số dư sẽ tự cập nhật."
              : success
                ? "Số dư ví ký quỹ đã được cộng."
                : "Nếu bạn đã chuyển tiền, số dư sẽ được cộng khi hệ thống nhận được xác nhận. Nếu chưa, hãy tạo lệnh nạp mới."}
          </Text>
        </View>

        {waiting && !!t.checkoutUrl && (
          <SheetButton label="Mở trang thanh toán" onPress={t.openCheckout} />
        )}
        {waiting && t.mockPay && (
          <SheetButton
            label="[DEV] Giả lập đã thanh toán"
            onPress={t.mockPay}
            loading={t.mockLoading}
            variant="soft"
          />
        )}
        <ErrorBox text={t.errorText} />
        <SheetButton
          label={waiting ? "Đóng, kiểm tra sau" : "Đóng"}
          onPress={t.close}
          variant="soft"
        />
      </WalletSheet>
    );
  }

  return (
    <WalletSheet visible={visible} onClose={t.close}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}>
        Nạp tiền ký quỹ
      </Text>
      <Text
        style={{
          fontSize: 13,
          marginTop: 4,
          marginBottom: 20,
          color: COLORS.inkMuted,
        }}
      >
        Tối thiểu {formatVnd(TOPUP_MIN)}, tối đa {formatVnd(TOPUP_MAX)}/lần. Bạn
        sẽ được chuyển sang trang thanh toán để chuyển khoản.
      </Text>

      <AmountField
        value={t.amountDisplay}
        onChange={t.handleChangeAmount}
        editable={!t.uncertain}
      />
      <QuickAmounts
        amounts={t.quickAmounts}
        onPick={t.pickAmount}
        format={formatVnd}
        disabled={t.uncertain}
      />

      <ErrorBox text={t.errorText} />

      <SheetButton
        label={t.uncertain ? "Thử lại" : "Tiếp tục thanh toán"}
        onPress={t.submit}
        loading={t.isLoading}
      />
    </WalletSheet>
  );
}
