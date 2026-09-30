import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS } from "@/constants/theme";
import {
  AuthFooter,
  AuthScreen,
  ErrorNotice,
  FormField,
  StepProgress,
} from "@/features/auth/components/AuthKit";
import {
  MIN_PASSWORD_LENGTH,
  STEP_LABELS,
  useForgotPassword,
} from "@/features/auth/hooks/useForgotPassword";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

const COPY = {
  request: {
    title: "Quên mật khẩu?",
    subtitle:
      "Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.",
  },
  verify: { title: "Nhập mã xác nhận", subtitle: "" },
  reset: {
    title: "Đặt mật khẩu mới",
    subtitle: "Nhập mật khẩu mới cho tài khoản của bạn.",
  },
  done: {
    title: "Đổi mật khẩu thành công",
    subtitle: "Bạn có thể đăng nhập lại bằng mật khẩu mới.",
  },
} as const;

export default function ForgotPasswordScreen() {
  const f = useForgotPassword();
  const copy = COPY[f.step];

  const subtitle = f.step === "verify" ? undefined : copy.subtitle || undefined;

  return (
    <AuthScreen
      title={copy.title}
      subtitle={subtitle}
      footer={
        f.step === "request" ? (
          <AuthFooter
            prompt="Nhớ mật khẩu rồi?"
            linkLabel="Đăng nhập"
            href="/(auth)/login"
          />
        ) : undefined
      }
    >
      {f.step !== "done" && (
        <StepProgress current={f.stepIndex} labels={STEP_LABELS} />
      )}

      {f.step === "request" && (
        <>
          <FormField label="Email">
            <FormInput
              icon="mail"
              placeholder="ban@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={f.email}
              onChangeText={f.setEmail}
            />
          </FormField>

          <ErrorNotice message={f.error} />

          <PrimaryButton
            label="Gửi mã xác nhận"
            variant="dark"
            loading={f.isSending}
            loadingLabel="Đang gửi..."
            icon="arrow-right"
            onPress={f.handleSendCode}
          />
        </>
      )}

      {f.step === "verify" && (
        <>
          <Text className="text-ink-soft text-base leading-6 mb-5">
            Mã xác nhận đã được gửi tới{" "}
            <Text className="text-ink font-bold">{f.email}</Text>
          </Text>

          <FormField label="Mã xác nhận">
            <FormInput
              icon="shield"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={f.otp}
              onChangeText={f.setOtp}
              style={{ letterSpacing: 6, fontSize: 18, fontWeight: "800" }}
            />
          </FormField>

          <ErrorNotice message={f.error} />

          <PrimaryButton
            label="Xác nhận"
            variant="dark"
            loading={f.isVerifying}
            loadingLabel="Đang xác nhận..."
            onPress={f.handleVerifyOtp}
          />

          <View className="mt-3">
            <PrimaryButton
              label={
                f.countdown > 0
                  ? `Gửi lại mã sau ${f.countdown}s`
                  : "Gửi lại mã"
              }
              variant="outline"
              disabled={f.countdown > 0 || f.isSending}
              onPress={f.handleSendCode}
            />
          </View>
        </>
      )}

      {f.step === "reset" && (
        <>
          <FormField label="Mật khẩu mới">
            <FormInput
              icon="lock"
              isPassword
              placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
              value={f.newPassword}
              onChangeText={f.setNewPassword}
            />
          </FormField>

          <FormField label="Xác nhận mật khẩu mới">
            <FormInput
              icon="lock"
              isPassword
              placeholder="Nhập lại mật khẩu mới"
              value={f.confirmPassword}
              onChangeText={f.setConfirmPassword}
            />
          </FormField>

          <ErrorNotice message={f.error} />

          <PrimaryButton
            label="Đặt lại mật khẩu"
            variant="dark"
            loading={f.isResetting}
            loadingLabel="Đang cập nhật..."
            onPress={f.handleResetPassword}
          />
        </>
      )}

      {f.step === "done" && (
        <>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-success-light items-center justify-center">
              <View className="w-14 h-14 rounded-full bg-success items-center justify-center">
                <Feather name="check" size={28} color={COLORS.white} />
              </View>
            </View>
          </View>

          <PrimaryButton
            label="Về đăng nhập"
            variant="dark"
            icon="arrow-right"
            onPress={f.goToLogin}
          />
        </>
      )}
    </AuthScreen>
  );
}
