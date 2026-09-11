import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ROUTES } from "@/config/constants";
import { useLoginMutation } from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { loginSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
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
      dispatch(setUser(res.user));
      showSuccessToast(
        "Đăng nhập thành công",
        `Chào mừng trở lại, ${res.user.first_name || ""}`,
      );
      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const errors = e?.data?.errors;
      let message = "Đăng nhập thất bại, vui lòng thử lại";
      if (errors && typeof errors === "object") {
        const firstField = Object.keys(errors)[0];
        const firstMessage = Array.isArray(errors[firstField])
          ? errors[firstField][0]
          : errors[firstField];
        message = firstMessage || message;
      } else {
        message = e?.data?.message || message;
      }
      setError(message);
      showErrorToast("Đăng nhập thất bại", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        className="flex-1 bg-[#F8F9FC]"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[420px] self-center">
          <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 sm:p-10">
            <View className="flex-row items-center mb-8">
              <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
                <Feather name="briefcase" size={16} color="#2563EB" />
              </View>
              <Text className="text-[#111827] text-base font-semibold tracking-tight">
                CleanWise <Text className="text-[#2563EB]">Staff</Text>
              </Text>
            </View>

            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Nhân viên đăng nhập
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Đăng nhập để xem lịch làm việc và nhận đơn mới.
            </Text>

            <Text className="text-[#111827] text-sm mb-2">Số điện thoại</Text>
            <View className="mb-4">
              <FormInput
                icon="phone"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#111827] text-sm">Mật khẩu</Text>
              <Link href="/(auth)/forgot-password">
                <Text className="text-[#2563EB] text-sm font-medium">
                  Quên mật khẩu?
                </Text>
              </Link>
            </View>
            <View className="mb-2">
              <FormInput
                icon="lock"
                isPassword
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-2 mb-1">{error}</Text>
            )}

            <View className="mt-5">
              <PrimaryButton
                label="Đăng nhập"
                loading={isLoading}
                loadingLabel="Đang đăng nhập..."
                icon="arrow-right"
                onPress={handleLogin}
              />
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-[#6B7280] text-[15px]">
                Chưa có tài khoản?{" "}
              </Text>
              <Link href="/(auth)/register">
                <Text className="text-[#2563EB] font-semibold text-[15px]">
                  Đăng ký
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
