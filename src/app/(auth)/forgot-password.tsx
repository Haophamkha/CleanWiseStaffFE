import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

import {
  AuthFooter,
  AuthScreen,
  ErrorNotice,
  FormField,
  StepProgress,
} from "@/features/auth/components/AuthKit";
import {
  MIN_PASSWORD_LENGTH,
  getLocalizedStepLabels,
  useForgotPassword,
} from "@/features/auth/hooks/useForgotPassword";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

function getLocalizedCopy() {
  return {
    request: {
      title: tr("Quên mật khẩu?"),
      subtitle:
        tr("Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu."),
    },
    verify: { title: tr("Nhập mã xác nhận"), subtitle: "" },
    reset: {
      title: tr("Đặt mật khẩu mới"),
      subtitle: tr("Nhập mật khẩu mới cho tài khoản của bạn."),
    },
    done: {
      title: tr("Đổi mật khẩu thành công"),
      subtitle: tr("Bạn có thể đăng nhập lại bằng mật khẩu mới."),
    },
  } as const;
}

export default function ForgotPasswordScreen() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const f = useForgotPassword();
  const copy = getLocalizedCopy()[f.step];

  const subtitle = f.step === "verify" ? undefined : copy.subtitle || undefined;

  return (
    <AuthScreen
      title={copy.title}
      subtitle={subtitle}
      footer={
        f.step === "request" ? (
          <AuthFooter
            prompt={tr("Nhớ mật khẩu rồi?")}
            linkLabel={tr("Đăng nhập")}
            href="/(auth)/login"
          />
        ) : undefined
      }
    >
      {f.step !== "done" && (
        <StepProgress current={f.stepIndex} labels={getLocalizedStepLabels()} />
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
            label={tr("Gửi mã xác nhận")}
            variant="dark"
            loading={f.isSending}
            loadingLabel={tr("Đang gửi...")}
            icon="arrow-right"
            onPress={f.handleSendCode}
          />
        </>
      )}

      {f.step === "verify" && (
        <>
          <Text className="text-ink-soft text-base leading-6 mb-5">
            {tr("Mã xác nhận đã được gửi tới")}{" "}
            <Text className="text-ink font-bold">{f.email}</Text>
          </Text>

          <FormField label={tr("Mã xác nhận")}>
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
            label={tr("Xác nhận")}
            variant="dark"
            loading={f.isVerifying}
            loadingLabel={tr("Đang xác nhận...")}
            onPress={f.handleVerifyOtp}
          />

          <View className="mt-3">
            <PrimaryButton
              label={
                f.countdown > 0
                  ? tr("Gửi lại mã sau {{value0}}s", { value0: f.countdown })
                  : tr("Gửi lại mã")
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
          <FormField label={tr("Mật khẩu mới")}>
            <FormInput
              icon="lock"
              isPassword
              placeholder={tr("Ít nhất {{value0}} ký tự", { value0: MIN_PASSWORD_LENGTH })}
              value={f.newPassword}
              onChangeText={f.setNewPassword}
            />
          </FormField>

          <FormField label={tr("Xác nhận mật khẩu mới")}>
            <FormInput
              icon="lock"
              isPassword
              placeholder={tr("Nhập lại mật khẩu mới")}
              value={f.confirmPassword}
              onChangeText={f.setConfirmPassword}
            />
          </FormField>

          <ErrorNotice message={f.error} />

          <PrimaryButton
            label={tr("Đặt lại mật khẩu")}
            variant="dark"
            loading={f.isResetting}
            loadingLabel={tr("Đang cập nhật...")}
            onPress={f.handleResetPassword}
          />
        </>
      )}

      {f.step === "done" && (
        <>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-success-light items-center justify-center">
              <View className="w-14 h-14 rounded-full bg-success-fill items-center justify-center">
                <Feather name="check" size={28} color={COLORS.white} />
              </View>
            </View>
          </View>

          <PrimaryButton
            label={tr("Về đăng nhập")}
            variant="dark"
            icon="arrow-right"
            onPress={f.goToLogin}
          />
        </>
      )}
    </AuthScreen>
  );
}
