import {
  earningsApi,
  useGetWithdrawQuery,
  useRequestWithdrawMutation,
} from "@/features/earnings/api/earningsApi";
import {
  errorMessage,
  isUncertain,
  MIN_ESCROW_BALANCE,
  POLL_MS,
  QUICK_AMOUNTS,
  useIntentKey,
  WITHDRAW_MAX,
  WITHDRAW_MIN,
} from "@/features/earnings/hooks/walletHelpers";
import { formatVnd } from "@/features/earnings/utils/earningsFormat";
import { useGetPaymentMethodsQuery } from "@/features/payment/api/paymentMethodApi";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";

const parseAmount = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

type Params = {
  walletBalance: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function useWithdraw({ walletBalance, onClose, onSuccess }: Params) {
  const dispatch = useDispatch();
  const [rawInput, setRawInput] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [withdrawId, setWithdrawId] = useState<number | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [pollDone, setPollDone] = useState(false);

  const [requestWithdraw, { isLoading }] = useRequestWithdrawMutation();
  const { getKey, resetKey } = useIntentKey();

  const { data: allMethods = [], isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();
  const methods = useMemo(
    () => allMethods.filter((m) => m.method_type === "BANK_ACCOUNT"),
    [allMethods],
  );
  const selected =
    methods.find((m) => m.id === selectedId) ??
    methods.find((m) => m.is_default) ??
    methods[0] ??
    null;

  const { data: polled } = useGetWithdrawQuery(withdrawId ?? 0, {
    skip: withdrawId == null,
    pollingInterval: pollDone ? 0 : POLL_MS,
  });
  const record = polled ?? null;
  const status = record?.status ?? createdStatus;
  const finished = status === "SUCCESS" || status === "FAILED";

  useEffect(() => {
    if (finished) {
      setPollDone(true);
      dispatch(earningsApi.util.invalidateTags(["Wallet"]));
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const amount = parseAmount(rawInput);
  const maxWithdrawable = Math.min(
    Math.max(walletBalance - MIN_ESCROW_BALANCE, 0),
    WITHDRAW_MAX,
  );
  const quickAmounts = QUICK_AMOUNTS.filter((v) => v <= maxWithdrawable);

  const validationError =
    amount <= 0
      ? null
      : amount < WITHDRAW_MIN
        ? `Số tiền rút tối thiểu là ${formatVnd(WITHDRAW_MIN)}.`
        : amount > maxWithdrawable
          ? `Ví ký quỹ phải còn tối thiểu ${formatVnd(MIN_ESCROW_BALANCE)}, mỗi lần rút tối đa ${formatVnd(WITHDRAW_MAX)}. Bạn có thể rút tối đa ${formatVnd(maxWithdrawable)}.`
          : null;

  const canSubmit = !!selected && amount > 0 && !validationError && !isLoading;

  const reset = () => {
    resetKey();
    setRawInput("");
    setWithdrawId(null);
    setCreatedStatus(null);
    setUncertain(false);
    setErrorText("");
    setPollDone(false);
  };

  const handleClose = () => {
    if (uncertain) {
      Alert.alert(
        "Chưa rõ kết quả",
        "Yêu cầu rút trước đó có thể đã được gửi. Hãy kiểm tra lịch sử giao dịch trước khi rút lại.",
      );
    }
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selected) return;
    setErrorText("");
    try {
      const res = await requestWithdraw({
        amount,
        paymentMethodId: selected.id,
        idempotencyKey: getKey(`${amount}:${selected.id}`),
      }).unwrap();
      resetKey();
      setUncertain(false);
      setPollDone(false);
      setWithdrawId(res.id);
      setCreatedStatus(res.status);
    } catch (err: any) {
      if (err?.status === 429) return; // interceptor đã báo toast
      if (isUncertain(err)) {
        setUncertain(true);
        setErrorText(
          err?.status === 503
            ? "Hệ thống tạm thời chưa xử lý được. Bấm Gửi lại sau ít giây, bạn sẽ không bị rút trùng."
            : "Chưa rõ yêu cầu đã được gửi chưa. Bấm Gửi lại, bạn sẽ không bị rút trùng.",
        );
      } else {
        resetKey();
        setUncertain(false);
        setErrorText(
          errorMessage(
            err,
            "Không thể tạo yêu cầu rút tiền, vui lòng thử lại.",
          ),
        );
      }
    }
  };

  return {
    isLoading,
    canSubmit,
    uncertain,
    message: validationError ?? errorText,
    amountDisplay: rawInput ? Number(rawInput).toLocaleString("vi-VN") : "",
    balanceText: formatVnd(walletBalance),
    hintText: `Ví ký quỹ phải giữ tối thiểu ${formatVnd(MIN_ESCROW_BALANCE)}. Bạn có thể rút tối đa ${formatVnd(maxWithdrawable)}.`,
    quickAmounts,
    methods,
    methodsLoading,
    selected,
    selectMethod: setSelectedId,
    record,
    status,
    submitted: withdrawId != null,
    submittedAmount: record ? Number(record.amount) : amount,
    handleChangeAmount: (t: string) => setRawInput(String(parseAmount(t))),
    handleMaxPress: () => setRawInput(String(maxWithdrawable)),
    handleClose,
    handleSubmit,
  };
}
