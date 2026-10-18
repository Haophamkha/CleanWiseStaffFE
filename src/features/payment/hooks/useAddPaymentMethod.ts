import {
    useCreateBankPaymentMethodMutation,
    useGetBankCatalogQuery,
    useGetPaymentMethodOptionsQuery,
    useStartBankAccountVerificationMutation,
    useConfirmBankAccountVerificationMutation,
} from "@/features/payment/api/paymentMethodApi";
import type {
    BankCatalogItem,
    PaymentMethodOption,
} from "@/features/payment/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import type { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState, type ComponentProps } from "react";
import { Alert } from "react-native";

type FeatherName = ComponentProps<typeof Feather>["name"];

type Step = "options" | "bank-form";

export type OptionView = {
  option: PaymentMethodOption;
  icon: FeatherName;
  available: boolean;
  statusLabel: string;
};

const optionIcon = (code: PaymentMethodOption["code"]): FeatherName => {
  if (code === "MOMO") return "smartphone";
  if (code === "VNPAY") return "shopping-bag";
  return "credit-card";
};

const getFirstError = (error: any) => {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors).flat().find(Boolean);
    if (typeof first === "string") return first;
  }
  return error?.data?.message || "Không thể lưu tài khoản. Vui lòng thử lại.";
};

export function useAddPaymentMethod() {
  const [step, setStep] = useState<Step>("options");
  const [selectedBank, setSelectedBank] = useState<BankCatalogItem | null>(
    null,
  );
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [identity, setIdentity] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMethodId, setOtpMethodId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState("");

  const { data: options = [], isLoading: isLoadingOptions } =
    useGetPaymentMethodOptionsQuery();
  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    isError: isBankError,
    refetch: refetchBanks,
  } = useGetBankCatalogQuery(undefined, { skip: step !== "bank-form" });
  const [createBankMethod, { isLoading: isSaving }] =
    useCreateBankPaymentMethodMutation();
  const [startVerification, { isLoading: isStartingVerification }] =
    useStartBankAccountVerificationMutation();
  const [confirmVerification, { isLoading: isConfirming }] =
    useConfirmBankAccountVerificationMutation();
  const isBusy = isSaving || isStartingVerification || isConfirming;

  const visibleOptions = useMemo<PaymentMethodOption[]>(
    () =>
      options.length
        ? options
        : [
            { code: "MOMO", name: "Ví MoMo", status: "COMING_SOON" },
            { code: "VNPAY", name: "VNPAY", status: "COMING_SOON" },
            {
              code: "BANK_ACCOUNT",
              name: "Tài khoản ngân hàng",
              status: "AVAILABLE",
            },
          ],
    [options],
  );

  const optionViews = useMemo<OptionView[]>(
    () =>
      visibleOptions.map((option) => {
        const available = option.status === "AVAILABLE";
        return {
          option,
          icon: optionIcon(option.code),
          available,
          statusLabel: available ? "Có thể thêm ngay" : "Sắp hỗ trợ",
        };
      }),
    [visibleOptions],
  );

  const handleBack = () => {
    if (isBusy) return;
    if (step === "bank-form") {
      setStep("options");
      setError("");
    } else {
      router.back();
    }
  };

  const handleOption = (option: PaymentMethodOption) => {
    if (option.code === "BANK_ACCOUNT" && option.status === "AVAILABLE") {
      setStep("bank-form");
      return;
    }
    Alert.alert(
      "Sắp hỗ trợ",
      `CleanWise đang hoàn thiện tính năng liên kết ${option.name}.`,
    );
  };

  const changeAccountNumber = (value: string) => {
    setAccountNumber(value.replace(/\D/g, ""));
    setError("");
  };

  const changeAccountHolderName = (value: string) => {
    setAccountHolderName(value);
    setError("");
  };

  const openPicker = () => setPickerVisible(true);
  const closePicker = () => setPickerVisible(false);
  const selectBank = (bank: BankCatalogItem) => {
    setSelectedBank(bank);
    setPickerVisible(false);
    setError("");
  };

  const handleSubmit = async () => {
    const normalizedAccount = accountNumber.replace(/\s/g, "");
    if (!selectedBank) return setError("Vui lòng chọn ngân hàng.");
    if (!/^\d{6,19}$/.test(normalizedAccount)) {
      return setError("Số tài khoản phải gồm từ 6 đến 19 chữ số.");
    }
    if (accountHolderName.trim().length < 2) {
      return setError("Vui lòng nhập tên chủ tài khoản.");
    }
    if (!/^\d{9,14}$/.test(identity)) {
      return setError("CCCD/CMND Sandbox phải gồm từ 9 đến 14 chữ số.");
    }
    if (!/^0\d{9}$/.test(mobile)) {
      return setError("Số điện thoại Sandbox phải gồm 10 chữ số và bắt đầu bằng 0.");
    }

    setError("");
    try {
      const method = await createBankMethod({
        bank_bin: selectedBank.bin,
        bank_code: selectedBank.code,
        bank_name: selectedBank.short_name || selectedBank.name,
        account_number: normalizedAccount,
        account_holder_name: accountHolderName.trim().toLocaleUpperCase("vi"),
        display_name: displayName.trim() || undefined,
        is_default: isDefault,
      }).unwrap();
      showSuccessToast("Đã thêm tài khoản ngân hàng");
      try {
        const result = await startVerification({ id: method.id, identity, mobile }).unwrap();
        if (result.requires_otp) {
          setOtpMethodId(method.id);
          return;
        }
      } catch (verificationError: any) {
        showSuccessToast(
          "Tài khoản đã được lưu",
          verificationError?.data?.message ?? "Bạn có thể thử lại trong danh sách tài khoản.",
        );
        router.back();
        return;
      }
      router.back();
    } catch (requestError) {
      setError(getFirstError(requestError));
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpMethodId) return;
    try {
      await confirmVerification({ id: otpMethodId, otp }).unwrap();
      showSuccessToast("Xác minh Sandbox TINGEE thành công");
      setOtpMethodId(null);
      router.back();
    } catch (verificationError: any) {
      showErrorToast("OTP chưa hợp lệ", verificationError?.data?.message ?? "Vui lòng thử lại.");
    }
  };

  return {
    step,
    headerTitle:
      step === "options" ? "Thêm phương thức" : "Thêm tài khoản ngân hàng",
    isSaving: isBusy,
    error,
    handleBack,
    handleSubmit,

    // Bước 1: chọn phương thức
    isLoadingOptions,
    optionViews,
    handleOption,

    // Bước 2: form ngân hàng
    banks,
    bankLabel: isLoadingBanks
      ? "Đang tải ngân hàng..."
      : selectedBank?.short_name || "Chọn ngân hàng",
    hasBank: !!selectedBank,
    bankDisabled: isLoadingBanks || isBankError,
    isBankError,
    refetchBanks,
    pickerVisible,
    openPicker,
    closePicker,
    selectBank,
    accountNumber,
    changeAccountNumber,
    accountHolderName,
    changeAccountHolderName,
    identity,
    setIdentity,
    mobile,
    setMobile,
    otp,
    setOtp,
    otpMethodId,
    setOtpMethodId,
    handleConfirmOtp,
    isConfirming,
    displayName,
    setDisplayName,
    isDefault,
    setIsDefault,
  };
}

export type AddPaymentMethodState = ReturnType<typeof useAddPaymentMethod>;
