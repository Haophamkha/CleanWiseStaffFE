import {
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyResetOtpMutation,
} from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";
import { forgotPasswordSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useEffect, useState } from "react";

const RESEND_SECONDS = 60;
export const MIN_PASSWORD_LENGTH = 8;

export type Step = "request" | "verify" | "reset" | "done";

export const STEP_LABELS = ["Email", "Mã xác nhận", "Mật khẩu mới"];
const STEP_INDEX: Record<Step, number> = {
  request: 0,
  verify: 1,
  reset: 2,
  done: 3,
};

export function useForgotPassword() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  useEffect(() => {
    if (!resendAt) return;
    const tick = () => {
      const remain = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setCountdown(remain);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim();
    const result = forgotPasswordSchema.safeParse({ contact: trimmedEmail });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await forgotPassword({ email: trimmedEmail }).unwrap();
      setStep("verify");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      showSuccessToast("Đã gửi mã xác nhận", "Kiểm tra email của bạn");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Mã xác nhận gồm 6 chữ số");
      return;
    }
    setError("");
    try {
      await verifyResetOtp({ email: email.trim(), code: otp.trim() }).unwrap();
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    try {
      await resetPassword({
        email: email.trim(),
        code: otp.trim(),
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }).unwrap();
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return {
    step,
    stepIndex: STEP_INDEX[step],
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    countdown,
    isSending,
    isVerifying,
    isResetting,
    handleSendCode,
    handleVerifyOtp,
    handleResetPassword,
    goToLogin: () => router.replace("/(auth)/login"),
  };
}
