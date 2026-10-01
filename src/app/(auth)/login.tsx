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
        title="Nhân viên đăng nhập"
        subtitle="Đăng nhập để xem lịch làm việc và nhận đơn mới."
        footer={
          <AuthFooter
            prompt="Chưa có tài khoản?"
            linkLabel="Đăng ký"
            href="/(auth)/register"
          />
        }
      >
        <FormField label="Số điện thoại">
          <FormInput
            icon="phone"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField
          label="Mật khẩu"
          right={
            <Link href="/(auth)/forgot-password">
              <LinkText>Quên mật khẩu?</LinkText>
            </Link>
          }
        >
          <FormInput
            icon="lock"
            isPassword
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChangeText={setPassword}
          />
        </FormField>

        <ErrorNotice message={error} />

        <View className="mt-1">
          <PrimaryButton
            label="Đăng nhập"
            variant="dark"
            loading={isLoading}
            loadingLabel="Đang đăng nhập..."
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
