import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { forgotPasswordSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const result = forgotPasswordSchema.safeParse({ contact: email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    // TODO: gắn API quên mật khẩu khi BE có endpoint riêng cho nhân viên
    setSent(true);
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

        {!sent ? (
          <>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Quên mật khẩu?
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật
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
                label="Gửi yêu cầu"
                icon="arrow-right"
                onPress={handleSubmit}
              />
            </View>
          </>
        ) : (
          <>
            <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-6">
              <Feather name="check" size={24} color="#2563EB" />
            </View>
            <Text className="text-[#111827] text-[26px] leading-8 font-semibold mb-2">
              Đã gửi yêu cầu
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Nếu <Text className="text-[#111827] font-medium">{email}</Text>{" "}
              tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn trong ít phút.
            </Text>

            <TouchableOpacity
              className="bg-[#2563EB] rounded-2xl py-4 items-center"
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-white font-semibold text-[15px]">
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </>
        )}

        {!sent && (
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
