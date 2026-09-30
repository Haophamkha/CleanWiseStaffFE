import { ROUTES } from "@/config/constants";
import { saveTokens, useLoginMutation } from "@/features/auth/api/authApi";
import { setUser } from "@/features/auth/stores/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { getErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { loginSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";

export function useLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ phone, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      const res = await login({ phone, password }).unwrap();

      // Check role TRƯỚC khi lưu token, nên không có gì phải xóa
      if (res.user?.role !== "WORKER") {
        const message =
          "Tài khoản này không phải tài khoản nhân viên. Vui lòng dùng đúng ứng dụng dành cho vai trò của bạn.";
        setError(message);
        showErrorToast("Không có quyền truy cập", message);
        return;
      }

      await saveTokens(res.access, res.refresh);
      dispatch(baseApi.util.resetApiState());
      dispatch(setUser(res.user));
      showSuccessToast(
        "Đăng nhập thành công",
        `Chào mừng trở lại, ${res.user.first_name || ""}`,
      );
      router.replace(ROUTES.HOME);
    } catch (e: any) {
      // 429 đã được interceptor toast, ở đây chỉ hiện lỗi trong form
      const message =
        e?.status === 429
          ? "Bạn thử quá nhiều lần, vui lòng đợi một phút rồi thử lại"
          : getErrorMessage(e);
      setError(message);
      if (e?.status !== 429) showErrorToast("Đăng nhập thất bại", message);
    }
  };

  return {
    phone,
    setPhone,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  };
}
