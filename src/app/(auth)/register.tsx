import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = () => {
    // TODO: gắn API đăng ký nhân viên khi BE có endpoint riêng
    setError("Chức năng đăng ký nhân viên đang được phát triển.");
  };

  const fields: {
    key: keyof typeof form;
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    placeholder: string;
    keyboardType?: "phone-pad" | "email-address" | "default";
  }[] = [
    {
      key: "username",
      label: "Tên đăng nhập",
      icon: "user",
      placeholder: "vd. lan.nguyen92",
    },
    { key: "first_name", label: "Họ", icon: "user", placeholder: "Nguyễn" },
    { key: "last_name", label: "Tên", icon: "user", placeholder: "Thị Lan" },
    {
      key: "email",
      label: "Email",
      icon: "mail",
      placeholder: "ban@email.com",
      keyboardType: "email-address",
    },
    {
      key: "phone_number",
      label: "Số điện thoại",
      icon: "phone",
      placeholder: "090 123 4567",
      keyboardType: "phone-pad",
    },
  ];

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
              Đăng ký nhân viên
            </Text>
            <Text className="text-[#6B7280] text-[15px] leading-5 mb-8">
              Tạo tài khoản để bắt đầu nhận việc cùng CleanWise.
            </Text>

            {fields.map((f) => (
              <View key={f.key} className="mb-4">
                <Text className="text-[#111827] text-sm mb-2">{f.label}</Text>
                <FormInput
                  icon={f.icon}
                  placeholder={f.placeholder}
                  autoCapitalize="none"
                  keyboardType={f.keyboardType ?? "default"}
                  value={form[f.key]}
                  onChangeText={(v) => update(f.key, v)}
                />
              </View>
            ))}

            <Text className="text-[#111827] text-sm mb-2">Mật khẩu</Text>
            <View className="mb-4">
              <FormInput
                icon="lock"
                isPassword
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChangeText={(v) => update("password", v)}
              />
            </View>

            <Text className="text-[#111827] text-sm mb-2">
              Xác nhận mật khẩu
            </Text>
            <View className="mb-5">
              <FormInput
                icon="lock"
                isPassword
                placeholder="Nhập lại mật khẩu"
                value={form.password_confirm}
                onChangeText={(v) => update("password_confirm", v)}
              />
            </View>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-1 mb-1">{error}</Text>
            )}

            <PrimaryButton
              label="Tạo tài khoản"
              onPress={handleRegister}
              style={{ marginTop: 4 }}
            />

            <View className="flex-row justify-center mt-7">
              <Text className="text-[#6B7280] text-[15px]">
                Đã có tài khoản?{" "}
              </Text>
              <Link href="/(auth)/login">
                <Text className="text-[#2563EB] font-semibold text-[15px]">
                  Đăng nhập
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
