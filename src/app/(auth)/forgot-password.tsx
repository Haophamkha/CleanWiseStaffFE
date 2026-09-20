import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetOtpMutation,
} from "@/services/authApi";
import { showSuccessToast } from "@/utils/toast";
import { forgotPasswordSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const RESEND_SECONDS = 60;

type Step = "request" | "verify" | "reset" | "done";

const getErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.data?.detail || fallback;
};

export default function ForgotPasswordScreen() {
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
    const result = forgotPasswordSchema.safeParse({ contact: email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await forgotPassword({ email }).unwrap();
      setStep("verify");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      showSuccessToast("Đã gửi mã xác nhận", "Kiểm tra email của bạn");
    } catch (err) {
      setError(getErrorMessage(err, "Không gửi được mã, thử lại sau."));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 4) {
      setError("Mã xác nhận không hợp lệ");
      return;
    }
    setError("");
    try {
      await verifyResetOtp({ email, code: otp.trim() }).unwrap();
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    try {
      await resetPassword({
        email,
        code: otp.trim(),
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }).unwrap();
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err, "Đặt lại mật khẩu thất bại, thử lại."));
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-[420px] bg-white rounded-[28px] border border-[#E5E7EB] p-8 sm:p-10">
        <View className="flex-row items-center mb-8">
          <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
            <Feather name="briefcase" size={16} color="#2563EB" />
          </View>
          <Text className="text-[#111827] text-base font-semibold tracking-tight">
            CleanWise <Text className="text-[#2563EB]">Staff</Text>
          </Text>
        </View>

        {step === "request" && (
          <>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Quên mật khẩu?
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật
              khẩu.
            </Text>

            <Text className="text-[#111827] text-sm mb-2">Email</Text>
            <View className="mb-2">
              <FormInput
                icon="mail"
                placeholder="ban@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-2 mb-1">{error}</Text>
            )}

            <View className="mt-5">
              <PrimaryButton
                label="Gửi mã xác nhận"
                loading={isSending}
                loadingLabel="Đang gửi..."
                icon="arrow-right"
                onPress={handleSendCode}
              />
            </View>
          </>
        )}

        {step === "verify" && (
          <>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Nhập mã xác nhận
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Mã xác nhận đã được gửi tới{" "}
              <Text className="text-[#111827] font-medium">{email}</Text>
            </Text>

            <Text className="text-[#111827] text-sm mb-2">Mã xác nhận</Text>
            <View className="mb-2">
              <FormInput
                icon="lock"
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-2 mb-1">{error}</Text>
            )}

            <View className="mt-5">
              <PrimaryButton
                label="Xác nhận"
                loading={isVerifying}
                loadingLabel="Đang xác nhận..."
                onPress={handleVerifyOtp}
              />
            </View>

            <TouchableOpacity
              className="items-center mt-5"
              onPress={handleSendCode}
              disabled={countdown > 0 || isSending}
            >
              <Text
                className={
                  countdown > 0
                    ? "text-[#9CA3AF] text-sm"
                    : "text-[#2563EB] font-semibold text-sm"
                }
              >
                {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "reset" && (
          <>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Đặt mật khẩu mới
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Text>

            <Text className="text-[#111827] text-sm mb-2">Mật khẩu mới</Text>
            <View className="mb-4">
              <FormInput
                icon="lock"
                isPassword
                placeholder="Ít nhất 6 ký tự"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <Text className="text-[#111827] text-sm mb-2">
              Xác nhận mật khẩu mới
            </Text>
            <View className="mb-2">
              <FormInput
                icon="lock"
                isPassword
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-2 mb-1">{error}</Text>
            )}

            <View className="mt-5">
              <PrimaryButton
                label="Đặt lại mật khẩu"
                loading={isResetting}
                loadingLabel="Đang cập nhật..."
                onPress={handleResetPassword}
              />
            </View>
          </>
        )}

        {step === "done" && (
          <>
            <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-6">
              <Feather name="check" size={24} color="#2563EB" />
            </View>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Đổi mật khẩu thành công
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Bạn có thể đăng nhập lại bằng mật khẩu mới.
            </Text>

            <TouchableOpacity
              className="items-center mt-5"
              onPress={handleSendCode}
              disabled={countdown > 0 || isSending}
            >
              <Text
                className={
                  countdown > 0
                    ? "text-[#9CA3AF] text-sm"
                    : "text-[#2563EB] font-semibold text-sm"
                }
              >
                {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-4"
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-[#6B7280] font-semibold text-sm">Hủy</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "request" && (
          <View className="flex-row justify-center mt-8">
            <Link href="/(auth)/login">
              <Text className="text-[#2563EB] font-semibold text-[15px]">
                Đăng nhập
              </Text>
            </Link>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
