import {
    useDeletePaymentMethodMutation,
    useGetPaymentMethodsQuery,
    useSetDefaultPaymentMethodMutation,
} from "@/features/payment/api/paymentMethodApi";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { useState } from "react";

export function usePaymentMethods() {
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
  const isMutating = isSettingDefault || isDeleting;

  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await setDefault(method.id).unwrap();
      showSuccessToast("Đã đặt làm tài khoản mặc định");
    } catch {
      showErrorToast("Không thể cập nhật", "Vui lòng thử lại sau.");
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
      showSuccessToast("Đã gỡ tài khoản ngân hàng");
    } catch {
      showErrorToast("Không thể gỡ", "Vui lòng thử lại sau.");
    }
  };

  const deleteMessage = deleteTarget
    ? `Bạn có chắc muốn gỡ ${deleteTarget.bank_name} ${deleteTarget.account_number_masked}?`
    : "";

  const goAdd = () => router.push("/payment-methods/add");

  return {
    methods,
    isLoading,
    isError,
    isRefreshing: isFetching && !isLoading,
    refetch,
    isMutating,
    handleSetDefault,
    requestDelete,
    deleteVisible,
    deleteMessage,
    cancelDelete,
    confirmDelete,
    goAdd,
  };
}
