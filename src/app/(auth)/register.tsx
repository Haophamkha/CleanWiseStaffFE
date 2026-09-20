import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ROUTES } from "@/config/constants";
import { useRegisterWorkerMutation } from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { registerWorkerSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    birth_date: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [registerWorker, { isLoading }] = useRegisterWorkerMutation();
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const dispatch = useAppDispatch();

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Xóa lỗi chung khi người dùng bắt đầu sửa form
    if (error) {
      setError("");
    }
  };

  const handleRegister = async () => {
    setError("");

    const validation = registerWorkerSchema.safeParse(form);

    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message ??
        "Thông tin đăng ký không hợp lệ.";

      setError(message);

      showErrorToast("Thông tin chưa hợp lệ", message);

      return;
    }

    if (!agreedToTerms) {
      const message =
        "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.";

      setError(message);

      showErrorToast("Chưa đồng ý điều khoản", message);

      return;
    }

    try {
      const res = await registerWorker(validation.data).unwrap();

      dispatch(setUser(res.user));

      showSuccessToast(
        "Tạo tài khoản thành công",
        "Hồ sơ của bạn đang ở trạng thái chờ hoàn thiện.",
      );

      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const errors = e?.data?.errors ?? e?.data;

      let message = "Đăng ký thất bại, vui lòng thử lại.";

      if (errors && typeof errors === "object") {
        const firstField = Object.keys(errors)[0];

        const firstMessage = Array.isArray(errors[firstField])
          ? errors[firstField][0]
          : errors[firstField];

        if (typeof firstMessage === "string") {
          message = firstMessage;
        }
      }

      setError(message);

      showErrorToast("Đăng ký thất bại", message);
    }
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
    {
      key: "first_name",
      label: "Họ",
      icon: "user",
      placeholder: "Nguyễn",
    },
    {
      key: "last_name",
      label: "Tên",
      icon: "user",
      placeholder: "Thị Lan",
    },
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
                <Text className="text-[#111827] text-sm mb-2">
                  {f.label} <Text className="text-[#DC2626]">*</Text>
                </Text>

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

            <Text className="text-[#111827] text-sm mb-2">
              Ngày sinh <Text className="text-[#DC2626]">*</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowBirthDatePicker(true)}
              className="flex-row items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-4"
            >
              <Feather name="calendar" size={17} color="#9CA3AF" />
              <Text
                className={
                  form.birth_date
                    ? "ml-3 text-[#111827] text-[15px]"
                    : "ml-3 text-[#9CA3AF] text-[15px]"
                }
              >
                {form.birth_date || "Chọn ngày sinh"}
              </Text>
            </TouchableOpacity>

            {showBirthDatePicker && (
              <DateTimePicker
                value={
                  form.birth_date
                    ? new Date(`${form.birth_date}T00:00:00`)
                    : new Date(2000, 0, 1)
                }
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowBirthDatePicker(false);
                  if (event.type === "dismissed" || !selectedDate) return;

                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  );
                  const day = String(selectedDate.getDate()).padStart(2, "0");

                  update("birth_date", `${year}-${month}-${day}`);
                }}
              />
            )}

            <Text className="text-[#111827] text-sm mb-2">
              Giới tính <Text className="text-[#DC2626]">*</Text>
            </Text>

            <View className="flex-row mb-4" style={{ gap: 8 }}>
              {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                <PrimaryButton
                  key={g}
                  label={g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Khác"}
                  onPress={() => update("gender", g)}
                  style={{
                    flex: 1,
                    backgroundColor: form.gender === g ? "#2563EB" : "#E5E7EB",
                  }}
                />
              ))}
            </View>

            <Text className="text-[#111827] text-sm mb-2">
              Mật khẩu <Text className="text-[#DC2626]">*</Text>
            </Text>

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
              Xác nhận mật khẩu <Text className="text-[#DC2626]">*</Text>
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

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setAgreedToTerms((prev) => !prev);
                if (error) setError("");
              }}
              className="flex-row items-start mb-5"
            >
              <Feather
                name={agreedToTerms ? "check-square" : "square"}
                size={20}
                color={agreedToTerms ? "#2563EB" : "#9CA3AF"}
                style={{ marginTop: 1, marginRight: 10 }}
              />
              <Text className="flex-1 text-[#374151] text-[14px] leading-5">
                Tôi đã đọc và đồng ý với{" "}
                <Text className="text-[#2563EB] font-semibold">
                  Điều khoản dịch vụ
                </Text>{" "}
                và{" "}
                <Text className="text-[#2563EB] font-semibold">
                  Chính sách bảo mật
                </Text>{" "}
                của CleanWise.
              </Text>
            </TouchableOpacity>

            {!!error && (
              <Text className="text-[#DC2626] text-sm mt-1 mb-1">{error}</Text>
            )}

            <PrimaryButton
              label="Tạo tài khoản"
              loading={isLoading}
              loadingLabel="Đang tạo tài khoản..."
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
