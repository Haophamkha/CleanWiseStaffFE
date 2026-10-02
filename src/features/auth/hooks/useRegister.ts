import { ROUTES } from "@/config/constants";
import {
    saveTokens,
    useRegisterWorkerMutation,
} from "@/features/auth/api/authApi";
import { setUser } from "@/features/auth/stores/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { getErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { registerWorkerSchema } from "@/utils/validators";
import type { Feather } from "@expo/vector-icons";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";

type Gender = "MALE" | "FEMALE" | "OTHER";

export type RegisterForm = {
  username: string;
  email: string;
  first_name: string; // Tên
  last_name: string; // Họ và tên đệm
  phone_number: string;
  gender: Gender;
  birth_date: string;
  password: string;
  password_confirm: string;
};

export type RegisterFieldConfig = {
  key: keyof RegisterForm;
  label: string;
  icon: ComponentProps<typeof Feather>["name"];
  placeholder: string;
  keyboardType?: "phone-pad" | "email-address" | "default";
  autoCapitalize?: "none" | "words";
};

export const PERSONAL_FIELDS: RegisterFieldConfig[] = [
  {
    key: "last_name",
    label: "Họ và tên đệm",
    icon: "user",
    placeholder: "Nguyễn Thị",
    autoCapitalize: "words",
  },
  {
    key: "first_name",
    label: "Tên",
    icon: "user",
    placeholder: "Lan",
    autoCapitalize: "words",
  },
];

export const ACCOUNT_FIELDS: RegisterFieldConfig[] = [
  {
    key: "username",
    label: "Tên đăng nhập",
    icon: "at-sign",
    placeholder: "vd. lan.nguyen92",
    autoCapitalize: "none",
  },
  {
    key: "email",
    label: "Email",
    icon: "mail",
    placeholder: "ban@email.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    key: "phone_number",
    label: "Số điện thoại",
    icon: "phone",
    placeholder: "090 123 4567",
    keyboardType: "phone-pad",
    autoCapitalize: "none",
  },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

export function useRegister() {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "MALE",
    birth_date: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const [registerWorker, { isLoading }] = useRegisterWorkerMutation();
  const dispatch = useAppDispatch();

  const update = (key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const toggleTerms = () => {
    setAgreedToTerms((prev) => !prev);
    if (error) setError("");
  };

  const handleBirthDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowBirthDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    update("birth_date", `${year}-${month}-${day}`);
  };

  const handleRegister = async () => {
    setError("");

    const validation = registerWorkerSchema.safeParse(form);

    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message ??
        "Thông tin đăng ký không hợp lệ.";

      setError(message);
      showErrorToast("Thông tin chưa hợp lệ", message);
      return;
    }

    if (!agreedToTerms) {
      const message =
        "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.";

      setError(message);
      showErrorToast("Chưa đồng ý điều khoản", message);
      return;
    }

    try {
      const res = await registerWorker(validation.data).unwrap();

      await saveTokens(res.access, res.refresh);
      dispatch(baseApi.util.resetApiState());
      dispatch(setUser(res.user));
      showSuccessToast(
        "Tạo tài khoản thành công",
        "Hồ sơ của bạn đang ở trạng thái chờ hoàn thiện.",
      );

      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const message = getErrorMessage(e);
      setError(message);
      showErrorToast("Đăng ký thất bại", message);
    }
  };

  return {
    form,
    update,
    error,
    isLoading,
    agreedToTerms,
    toggleTerms,
    showBirthDatePicker,
    openBirthDatePicker: () => setShowBirthDatePicker(true),
    handleBirthDateChange,
    handleRegister,
  };
}
