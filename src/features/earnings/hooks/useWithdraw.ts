import { useWithdrawWalletMutation } from "@/features/earnings/api/earningsApi";
import { formatVnd } from "@/features/earnings/utils/earningsFormat";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { useState } from "react";

const MIN_ESCROW_BALANCE = 400_000;

// Chỉ giữ số, bỏ mọi ký tự khác (dấu chấm phân cách, chữ...)
const parseAmountInput = (raw: string) => {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

type Params = {
  walletBalance: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function useWithdraw({ walletBalance, onClose, onSuccess }: Params) {
  const [rawInput, setRawInput] = useState("");
  const [withdrawWallet, { isLoading }] = useWithdrawWalletMutation();
  const [errorText, setErrorText] = useState<string | null>(null);
  const { getKey, resetKey } = useIdempotencyKey();

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
    resetKey(); // đóng modal mà chưa submit thành công -> hủy ý định rút hiện tại
    setRawInput("");
    setErrorText(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorText(null);
    try {
      await withdrawWallet({ amount, idempotencyKey: getKey() }).unwrap();
      resetKey(); // thành công -> lần rút tiếp theo là ý định mới
      setRawInput("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      // Reset ngay cả khi lỗi: user có thể sửa lại số tiền và bấm lại
      // trong cùng phiên modal, nên không giữ key cũ (tránh BE trả về
      // cache của request với số tiền cũ nếu key trùng nhau).
      resetKey();
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

  const handleChangeAmount = (text: string) =>
    setRawInput(String(parseAmountInput(text)));

  return {
    isLoading,
    canSubmit,
    message: validationError ?? errorText,
    amountDisplay: rawInput ? Number(rawInput).toLocaleString("vi-VN") : "",
    balanceText: formatVnd(walletBalance),
    hintText: `Ví ký quỹ phải giữ tối thiểu ${formatVnd(
      MIN_ESCROW_BALANCE,
    )}, bạn có thể rút tối đa ${formatVnd(maxWithdrawable)}`,
    handleChangeAmount,
    handleMaxPress,
    handleClose,
    handleSubmit,
  };
}
