import { useTranslation } from "react-i18next";

import {
    useConfirmBankAccountVerificationMutation,
    useStartBankAccountVerificationMutation,
    useDeletePaymentMethodMutation,
    useGetPaymentMethodsQuery,
    useSetDefaultPaymentMethodMutation,
} from "@/features/payment/api/paymentMethodApi";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { AppState } from "react-native";
import { useEffect, useState } from "react";

export function usePaymentMethods() {
  const { t: tr } = useTranslation();

  const {
    data: methods = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: isSettingDefault }] =
    useSetDefaultPaymentMethodMutation();
  const [deleteMethod, { isLoading: isDeleting }] =
    useDeletePaymentMethodMutation();
  const [startVerification, { isLoading: isVerifying }] =
    useStartBankAccountVerificationMutation();
  const [confirmVerification, { isLoading: isConfirming }] = useConfirmBankAccountVerificationMutation();
  const [otpMethodId, setOtpMethodId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [verifyMethodId, setVerifyMethodId] = useState<number | null>(null);
  const [identity, setIdentity] = useState("");
  const [mobile, setMobile] = useState("");
  const isMutating = isSettingDefault || isDeleting || isVerifying || isConfirming;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  const handleVerify = async (method: PaymentMethod) => {
    setIdentity("");
    setMobile("");
    setVerifyMethodId(method.id);
  };

  const handleStartVerification = async () => {
    if (!verifyMethodId) return;
    try {
      const result = await startVerification({ id: verifyMethodId, identity, mobile }).unwrap();
      const methodId = verifyMethodId;
      setVerifyMethodId(null);
      if (result.requires_otp) setOtpMethodId(methodId);
      else showSuccessToast(tr("Tài khoản đã được xác minh trên Sandbox TINGEE"));
      await refetch();
    } catch (error: any) {
      showErrorToast(
        tr("Không thể mở xác minh"),
        (error as any)?.data?.message ?? tr("Vui lòng thử lại sau."),
      );
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpMethodId) return;
    try {
      await confirmVerification({ id: otpMethodId, otp }).unwrap();
      setOtpMethodId(null);
      setOtp("");
      showSuccessToast(tr("Xác minh Sandbox thành công"));
      await refetch();
    } catch (error: any) {
      showErrorToast(tr("OTP chưa hợp lệ"), error?.data?.message ?? tr("Vui lòng thử lại."));
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await setDefault(method.id).unwrap();
      showSuccessToast(tr("Đã đặt làm tài khoản mặc định"));
    } catch {
      showErrorToast(tr("Không thể cập nhật"), tr("Vui lòng thử lại sau."));
    }
  };

  // Bấm "Xóa" trên thẻ -> hỏi xác nhận (trước đây là Alert.alert)
  const requestDelete = (method: PaymentMethod) => {
    setDeleteTarget(method);
    setDeleteVisible(true);
  };

  const cancelDelete = () => setDeleteVisible(false);

  const confirmDelete = async () => {
    const method = deleteTarget;
    setDeleteVisible(false);
    if (!method) return;
    try {
      await deleteMethod(method.id).unwrap();
      showSuccessToast(tr("Đã gỡ tài khoản ngân hàng"));
    } catch {
      showErrorToast(tr("Không thể gỡ"), tr("Vui lòng thử lại sau."));
    }
  };

  const deleteMessage = deleteTarget
    ? tr("Bạn có chắc muốn gỡ {{value0}} {{value1}}?", { value0: deleteTarget.bank_name, value1: deleteTarget.account_number_masked })
    : "";

  const goAdd = () => router.push("/payment-methods/add");

  return {
    methods,
    isLoading,
    isError,
    isRefreshing: isFetching && !isLoading,
    refetch,
    isMutating,
    otpMethodId,
    verifyMethodId,
    setVerifyMethodId,
    identity,
    setIdentity,
    mobile,
    setMobile,
    handleStartVerification,
    otp,
    setOtp,
    setOtpMethodId,
    handleConfirmOtp,
    isConfirming,
    handleSetDefault,
    handleVerify,
    requestDelete,
    deleteVisible,
    deleteMessage,
    cancelDelete,
    confirmDelete,
    goAdd,
  };
}
