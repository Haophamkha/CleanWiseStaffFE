import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  BankAccountForm,
  PaymentOptionList,
} from "@/features/payment/components/AddPaymentMethodKit";
import BankPickerModal from "@/features/payment/components/BankPickerModal";
import { useAddPaymentMethod } from "@/features/payment/hooks/useAddPaymentMethod";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
              label="Lưu và xác minh"
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
      <Modal visible={form.otpMethodId !== null} transparent animationType="fade" onRequestClose={() => form.setOtpMethodId(null)}>
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-5">
            <Text className="text-ink text-lg font-bold">Nhập OTP Sandbox</Text>
            <Text className="text-ink-soft mt-2 leading-5">Nhập mã OTP giả lập của kịch bản TINGEE.</Text>
            <TextInput className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={form.otp} onChangeText={(value) => form.setOtp(value.replace(/\D/g, "").slice(0, 8))} placeholder="Mã OTP" maxLength={8} />
            <View className="flex-row mt-5">
              <TouchableOpacity className="flex-1 py-3 items-center" onPress={() => form.setOtpMethodId(null)}><Text className="text-ink-soft font-semibold">Để sau</Text></TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 items-center bg-ink rounded-xl" onPress={form.handleConfirmOtp} disabled={form.isConfirming || form.otp.length < 4}><Text className="text-white font-bold">{form.isConfirming ? "Đang kiểm tra..." : "Xác nhận"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
