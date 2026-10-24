import { useTranslation } from "react-i18next";

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
  getLocalizedAccountFields,
  getLocalizedGenderOptions,
  getLocalizedPersonalFields,
  useRegister,
  type RegisterFieldConfig,
} from "@/features/auth/hooks/useRegister";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegisterScreen() {
  const { t: tr } = useTranslation();

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
      title={tr("Đăng ký nhân viên")}
      subtitle={tr("Tạo tài khoản để bắt đầu nhận việc cùng CleanWise.")}
      footer={
        <AuthFooter
          prompt={tr("Đã có tài khoản?")}
          linkLabel={tr("Đăng nhập")}
          href="/(auth)/login"
        />
      }
    >
      <SectionTitle icon="user" title={tr("Thông tin cá nhân")} />
      {getLocalizedPersonalFields().map(renderField)}

      <FormField label={tr("Ngày sinh")} required>
        <DateField
          value={form.birth_date}
          placeholder={tr("Chọn ngày sinh")}
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

      <FormField label={tr("Giới tính")} required>
        <SegmentedControl
          options={getLocalizedGenderOptions()}
          value={form.gender}
          onChange={(g) => update("gender", g)}
        />
      </FormField>

      <SectionTitle icon="smartphone" title={tr("Tài khoản và liên hệ")} />
      {getLocalizedAccountFields().map(renderField)}

      <SectionTitle icon="lock" title={tr("Bảo mật")} />
      <FormField label={tr("Mật khẩu")} required>
        <FormInput
          icon="lock"
          isPassword
          placeholder={tr("Tối thiểu 8 ký tự")}
          value={form.password}
          onChangeText={(v) => update("password", v)}
        />
      </FormField>
      <FormField label={tr("Xác nhận mật khẩu")} required>
        <FormInput
          icon="lock"
          isPassword
          placeholder={tr("Nhập lại mật khẩu")}
          value={form.password_confirm}
          onChangeText={(v) => update("password_confirm", v)}
        />
      </FormField>

      <TermsCheckbox checked={agreedToTerms} onToggle={toggleTerms} />

      <ErrorNotice message={error} />

      <PrimaryButton
        label={tr("Tạo tài khoản")}
        variant="dark"
        loading={isLoading}
        loadingLabel={tr("Đang tạo tài khoản...")}
        onPress={handleRegister}
      />
    </AuthScreen>
  );
}
