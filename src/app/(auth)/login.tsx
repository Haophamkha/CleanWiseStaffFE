import { useTranslation } from "react-i18next";

import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  AuthFooter,
  AuthScreen,
  ErrorNotice,
  FormField,
  LinkText,
} from "@/features/auth/components/AuthKit";
import { LoginSuccessOverlay } from "@/features/auth/components/LoginSuccessOverlay";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Link } from "expo-router";
import { View } from "react-native";

export default function LoginScreen() {
  const { t: tr } = useTranslation();

  const {
    phone,
    setPhone,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
    showSuccess,
    successName,
    finishLogin,
  } = useLogin();

  return (
    <>
      <AuthScreen
        title={tr("Nhân viên đăng nhập")}
        subtitle={tr("Đăng nhập để xem lịch làm việc và nhận đơn mới.")}
        footer={
          <AuthFooter
            prompt={tr("Chưa có tài khoản?")}
            linkLabel={tr("Đăng ký")}
            href="/(auth)/register"
          />
        }
      >
        <FormField label={tr("Số điện thoại")}>
          <FormInput
            icon="phone"
            placeholder={tr("Nhập số điện thoại")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField
          label={tr("Mật khẩu")}
          right={
            <Link href="/(auth)/forgot-password">
              <LinkText>{tr("Quên mật khẩu?")}</LinkText>
            </Link>
          }
        >
          <FormInput
            icon="lock"
            isPassword
            placeholder={tr("Nhập mật khẩu của bạn")}
            value={password}
            onChangeText={setPassword}
          />
        </FormField>

        <ErrorNotice message={error} />

        <View className="mt-1">
          <PrimaryButton
            label={tr("Đăng nhập")}
            variant="dark"
            loading={isLoading}
            loadingLabel={tr("Đang đăng nhập...")}
            icon="arrow-right"
            onPress={handleLogin}
          />
        </View>
      </AuthScreen>

      <LoginSuccessOverlay
        visible={showSuccess}
        name={successName}
        onFinish={finishLogin}
      />
    </>
  );
}
