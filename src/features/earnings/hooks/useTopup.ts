import { useTranslation } from "react-i18next";
import { getLocale } from "@/features/language/i18n";
import {
    earningsApi,
    useCreateTopupMutation,
    useGetTopupQuery,
    useMockConfirmTopupMutation,
} from "@/features/earnings/api/earningsApi";
import {
    errorMessage,
    isUncertain,
    POLL_MS,
    QUICK_AMOUNTS,
    TOPUP_MAX,
    TOPUP_MIN,
    useIntentKey,
} from "@/features/earnings/hooks/walletHelpers";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking } from "react-native";
import { useDispatch } from "react-redux";

const parseAmount = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

export function useTopup(onClose: () => void) {
  const { t: tr } = useTranslation();

  const dispatch = useDispatch();
  const [rawInput, setRawInput] = useState("");
  const [topupId, setTopupId] = useState<number | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [pollDone, setPollDone] = useState(false);

  const [createTopup, { isLoading }] = useCreateTopupMutation();
  const [mockConfirm, { isLoading: mockLoading }] =
    useMockConfirmTopupMutation();
  const { getKey, resetKey } = useIntentKey();

  const { data: polled, refetch } = useGetTopupQuery(topupId ?? 0, {
    skip: topupId == null,
    pollingInterval: pollDone ? 0 : POLL_MS,
  });
  const status = polled?.status ?? createdStatus;
  const finished = status != null && status !== "PENDING";
  const url = polled?.checkout_url ?? checkoutUrl;

  const finishedRef = useRef(false);
  finishedRef.current = finished;

  useEffect(() => {
    if (finished) setPollDone(true);
  }, [finished]);

  useEffect(() => {
    if (status === "SUCCESS") {
      dispatch(earningsApi.util.invalidateTags(["Wallet"]));
    }
  }, [status, dispatch]);

  // Quay lại app từ trình duyệt thanh toán -> kiểm tra ngay
  useEffect(() => {
    if (topupId == null) return;
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && !finishedRef.current) refetch();
    });
    return () => sub.remove();
  }, [topupId, refetch]);

  const amount = parseAmount(rawInput);

  const reset = () => {
    resetKey();
    setRawInput("");
    setTopupId(null);
    setCreatedStatus(null);
    setCheckoutUrl(null);
    setErrorText("");
    setUncertain(false);
    setPollDone(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const openCheckout = (target?: string | null) => {
    const link = target ?? url;
    if (!link) return;
    Linking.openURL(link).catch(() =>
      Alert.alert(tr("Không mở được trang thanh toán"), tr("Vui lòng thử lại.")),
    );
  };

  const submit = async () => {
    setErrorText("");
    if (!amount || amount < TOPUP_MIN) {
      setErrorText(
        tr("Số tiền nạp tối thiểu là {{value0}}đ.", { value0: TOPUP_MIN.toLocaleString(getLocale()) }),
      );
      return;
    }
    if (amount > TOPUP_MAX) {
      setErrorText(tr("Mỗi lần nạp tối đa {{value0}}đ.", { value0: TOPUP_MAX.toLocaleString(getLocale()) }));
      return;
    }
    try {
      const res = await createTopup({
        amount,
        idempotencyKey: getKey(String(amount)),
      }).unwrap();
      resetKey();
      setUncertain(false);
      setPollDone(false);
      setTopupId(res.id);
      setCreatedStatus(res.status);
      setCheckoutUrl(res.checkout_url);
      openCheckout(res.checkout_url);
    } catch (err: any) {
      if (err?.status === 429) return;
      if (isUncertain(err)) {
        setUncertain(true);
        setErrorText(
          tr("Chưa rõ yêu cầu đã được tạo chưa. Bấm thử lại, bạn sẽ không bị tạo trùng."),
        );
      } else {
        resetKey();
        setUncertain(false);
        setErrorText(
          errorMessage(
            err,
            tr("Không thể tạo liên kết nạp tiền, vui lòng thử lại."),
          ),
        );
      }
    }
  };

  const mockPay = async () => {
    if (topupId == null) return;
    try {
      await mockConfirm(topupId).unwrap();
      refetch();
    } catch (err: any) {
      setErrorText(errorMessage(err, tr("Giả lập thanh toán thất bại.")));
    }
  };

  return {
    amountDisplay: rawInput ? Number(rawInput).toLocaleString(getLocale()) : "",
    handleChangeAmount: (t: string) => setRawInput(String(parseAmount(t))),
    quickAmounts: QUICK_AMOUNTS,
    pickAmount: (v: number) => setRawInput(String(v)),
    isLoading,
    uncertain,
    errorText,
    submitted: topupId != null,
    status,
    finished,
    amountValue: polled ? Number(polled.amount) : amount,
    checkoutUrl: url,
    openCheckout: () => openCheckout(),
    mockPay: __DEV__ ? mockPay : undefined,
    mockLoading,
    close,
    submit,
  };
}
