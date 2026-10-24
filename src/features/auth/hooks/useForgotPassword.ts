import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import {
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyResetOtpMutation,
} from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";
import { getLocalizedForgotPasswordSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useEffect, useState } from "react";

const RESEND_SECONDS = 60;
export const MIN_PASSWORD_LENGTH = 8;

export type Step = "request" | "verify" | "reset" | "done";

export function getLocalizedStepLabels() {
  return ["Email", tr("Mã xác nhận"), tr("Mật khẩu mới")];
}
const STEP_INDEX: Record<Step, number> = {
  request: 0,
  verify: 1,
  reset: 2,
  done: 3,
};

export function useForgotPassword() {
  const { t: tr } = useTranslation();

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
    const result = getLocalizedForgotPasswordSchema().safeParse({ contact: trimmedEmail });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await forgotPassword({ email: trimmedEmail }).unwrap();
      setStep("verify");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      showSuccessToast(tr("Đã gửi mã xác nhận"), tr("Kiểm tra email của bạn"));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError(tr("Mã xác nhận gồm 6 chữ số"));
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
      setError(tr("Mật khẩu phải có ít nhất {{value0}} ký tự", { value0: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tr("Mật khẩu xác nhận không khớp"));
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
