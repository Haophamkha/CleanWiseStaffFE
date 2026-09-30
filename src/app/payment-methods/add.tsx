import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  BankAccountForm,
  PaymentOptionList,
} from "@/features/payment/components/AddPaymentMethodKit";
import BankPickerModal from "@/features/payment/components/BankPickerModal";
import { useAddPaymentMethod } from "@/features/payment/hooks/useAddPaymentMethod";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddWorkerPaymentMethodScreen() {
  const insets = useSafeAreaInsets();
  const form = useAddPaymentMethod();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SimpleHeader
        title={form.headerTitle}
        onBack={form.handleBack}
        backDisabled={form.isSaving}
      />

      {form.step === "options" ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <PaymentOptionList
            isLoading={form.isLoadingOptions}
            options={form.optionViews}
            onSelect={form.handleOption}
          />
        </ScrollView>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <BankAccountForm form={form} />
          </ScrollView>

          <View
            className="px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <PrimaryButton
              label="Lưu tài khoản"
              variant="primary"
              loading={form.isSaving}
              loadingLabel="Đang lưu..."
              onPress={form.handleSubmit}
            />
          </View>
        </>
      )}

      <BankPickerModal
        visible={form.pickerVisible}
        banks={form.banks}
        onClose={form.closePicker}
        onSelect={form.selectBank}
      />
    </KeyboardAvoidingView>
  );
}
