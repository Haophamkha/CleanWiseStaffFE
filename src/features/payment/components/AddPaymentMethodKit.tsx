import { FormInput } from "@/components/ui/FormInput";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type {
    AddPaymentMethodState,
    OptionView,
} from "@/features/payment/hooks/useAddPaymentMethod";
import type { PaymentMethodOption } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
    ActivityIndicator,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* ───────── Bước 1: chọn phương thức ───────── */

export function PaymentOptionList({
  isLoading,
  options,
  onSelect,
}: {
  isLoading: boolean;
  options: OptionView[];
  onSelect: (option: PaymentMethodOption) => void;
}) {
  return (
    <View>
      <Text className="text-ink text-base font-extrabold">
        Chọn phương thức nhận tiền
      </Text>
      <Text className="text-ink-soft text-sm mt-1 mb-5">
        Phương thức mặc định sẽ được dùng khi CleanWise hỗ trợ chi trả.
      </Text>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        options.map(({ option, icon, available, statusLabel }) => (
          <TouchableOpacity
            key={option.code}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
            className="flex-row items-center bg-surface border border-line p-4 mb-3"
            style={[{ borderRadius: RADIUS.card, minHeight: 72 }, SHADOWS.card]}
          >
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
                available ? "bg-ink" : "bg-accent-light"
              }`}
            >
              <Feather
                name={icon}
                size={22}
                color={available ? COLORS.white : COLORS.inkMuted}
              />
            </View>
            <View className="flex-1">
              <Text className="text-ink text-base font-extrabold">
                {option.name}
              </Text>
              <Text
                className={`text-sm mt-0.5 ${
                  available ? "text-ink-soft" : "text-ink-muted"
                }`}
              >
                {statusLabel}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.inkMuted} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

/* ───────── Bước 2: form tài khoản ngân hàng ───────── */

function Field({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <View className={last ? "" : "mb-4"}>
      <Text className="text-ink text-[13px] mb-2" style={TYPE.label}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function BankAccountForm({ form }: { form: AddPaymentMethodState }) {
  return (
    <View>
      <View className="flex-row bg-accent-light border border-line rounded-2xl p-4">
        <Feather
          name="info"
          size={18}
          color={COLORS.ink}
          style={{ marginTop: 1 }}
        />
        <Text className="flex-1 text-ink-soft text-sm leading-5 ml-3">
          Tài khoản được lưu ở trạng thái chưa xác minh. CleanWise không yêu cầu
          mật khẩu hoặc OTP ngân hàng.
        </Text>
      </View>

      <View
        className="bg-surface border border-line p-4 mt-5"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <Field label="Ngân hàng">
          <TouchableOpacity
            onPress={form.openPicker}
            disabled={form.bankDisabled}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 rounded-2xl"
            style={{
              backgroundColor: COLORS.accentLight,
              borderWidth: 1.5,
              borderColor: COLORS.line,
            }}
          >
            <Feather name="briefcase" size={17} color={COLORS.inkMuted} />
            <Text
              className={`flex-1 ml-3 text-[15px] ${
                form.hasBank ? "text-ink" : "text-ink-muted"
              }`}
              numberOfLines={1}
            >
              {form.bankLabel}
            </Text>
            <Feather name="chevron-down" size={17} color={COLORS.inkMuted} />
          </TouchableOpacity>
          {form.isBankError && (
            <TouchableOpacity
              onPress={() => form.refetchBanks()}
              className="mt-2 py-1"
            >
              <Text className="text-danger text-sm">
                Không tải được ngân hàng. Nhấn để thử lại.
              </Text>
            </TouchableOpacity>
          )}
        </Field>

        <Field label="Số tài khoản">
          <FormInput
            icon="hash"
            placeholder="Nhập số tài khoản"
            keyboardType="number-pad"
            value={form.accountNumber}
            onChangeText={form.changeAccountNumber}
            maxLength={19}
            isPassword
          />
        </Field>

        <Field label="Tên chủ tài khoản">
          <FormInput
            icon="user"
            placeholder="NGUYEN VAN A"
            value={form.accountHolderName}
            onChangeText={form.changeAccountHolderName}
            autoCapitalize="characters"
          />
        </Field>

        <Field label="Tên gợi nhớ (không bắt buộc)" last>
          <FormInput
            icon="tag"
            placeholder="Ví dụ: Tài khoản nhận lương"
            value={form.displayName}
            onChangeText={form.setDisplayName}
            maxLength={100}
          />
        </Field>
      </View>

      <View
        className="flex-row items-center justify-between bg-surface border border-line px-4 py-3.5 mt-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <View className="flex-1 pr-4">
          <Text className="text-ink font-extrabold">Đặt làm mặc định</Text>
          <Text className="text-ink-soft text-sm mt-0.5">
            Ưu tiên tài khoản này để nhận tiền.
          </Text>
        </View>
        <Switch
          value={form.isDefault}
          onValueChange={form.setIsDefault}
          trackColor={{ false: COLORS.accent, true: COLORS.ink }}
          thumbColor={COLORS.white}
        />
      </View>

      {!!form.error && (
        <View className="flex-row items-start bg-danger-light rounded-2xl p-3.5 mt-4">
          <Feather
            name="alert-circle"
            size={16}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-danger text-sm leading-5 ml-2.5">
            {form.error}
          </Text>
        </View>
      )}
    </View>
  );
}
