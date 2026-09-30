import { FormInput } from "@/components/ui/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  AuthFooter,
  AuthScreen,
  DateField,
  ErrorNotice,
  FormField,
  SectionTitle,
  SegmentedControl,
  TermsCheckbox,
} from "@/features/auth/components/AuthKit";
import {
  ACCOUNT_FIELDS,
  GENDER_OPTIONS,
  PERSONAL_FIELDS,
  useRegister,
  type RegisterFieldConfig,
} from "@/features/auth/hooks/useRegister";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegisterScreen() {
  const {
    form,
    update,
    error,
    isLoading,
    agreedToTerms,
    toggleTerms,
    showBirthDatePicker,
    openBirthDatePicker,
    handleBirthDateChange,
    handleRegister,
  } = useRegister();

  const renderField = (f: RegisterFieldConfig) => (
    <FormField key={f.key} label={f.label} required>
      <FormInput
        icon={f.icon}
        placeholder={f.placeholder}
        autoCapitalize={f.autoCapitalize ?? "none"}
        keyboardType={f.keyboardType ?? "default"}
        value={form[f.key]}
        onChangeText={(v) => update(f.key, v)}
      />
    </FormField>
  );

  return (
    <AuthScreen
      title="Đăng ký nhân viên"
      subtitle="Tạo tài khoản để bắt đầu nhận việc cùng CleanWise."
      footer={
        <AuthFooter
          prompt="Đã có tài khoản?"
          linkLabel="Đăng nhập"
          href="/(auth)/login"
        />
      }
    >
      <SectionTitle icon="user" title="Thông tin cá nhân" />
      {PERSONAL_FIELDS.map(renderField)}

      <FormField label="Ngày sinh" required>
        <DateField
          value={form.birth_date}
          placeholder="Chọn ngày sinh"
          onPress={openBirthDatePicker}
        />
      </FormField>

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
          onChange={handleBirthDateChange}
        />
      )}

      <FormField label="Giới tính" required>
        <SegmentedControl
          options={GENDER_OPTIONS}
          value={form.gender}
          onChange={(g) => update("gender", g)}
        />
      </FormField>

      <SectionTitle icon="smartphone" title="Tài khoản và liên hệ" />
      {ACCOUNT_FIELDS.map(renderField)}

      <SectionTitle icon="lock" title="Bảo mật" />
      <FormField label="Mật khẩu" required>
        <FormInput
          icon="lock"
          isPassword
          placeholder="Tối thiểu 8 ký tự"
          value={form.password}
          onChangeText={(v) => update("password", v)}
        />
      </FormField>
      <FormField label="Xác nhận mật khẩu" required>
        <FormInput
          icon="lock"
          isPassword
          placeholder="Nhập lại mật khẩu"
          value={form.password_confirm}
          onChangeText={(v) => update("password_confirm", v)}
        />
      </FormField>

      <TermsCheckbox checked={agreedToTerms} onToggle={toggleTerms} />

      <ErrorNotice message={error} />

      <PrimaryButton
        label="Tạo tài khoản"
        variant="dark"
        loading={isLoading}
        loadingLabel="Đang tạo tài khoản..."
        onPress={handleRegister}
      />
    </AuthScreen>
  );
}
