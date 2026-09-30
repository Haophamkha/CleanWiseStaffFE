import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS } from "@/constants/theme";
import { PersonalInfoForm } from "@/features/profile-setup/components/PersonalInfoForm";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { usePersonalInfo } from "@/features/profile-setup/hooks/usePersonalInfo";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PersonalInfoStep() {
  const insets = useSafeAreaInsets();
  const form = usePersonalInfo();

  if (form.isLoadingProfile) {
    return (
      <View className="flex-1 bg-canvas">
        <SimpleHeader title="Thông tin cá nhân" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SimpleHeader title="Thông tin cá nhân" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PersonalInfoForm form={form} />
      </ScrollView>

      <View
        className="px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <PrimaryButton
          label={form.submitLabel}
          variant="primary"
          loading={form.isBusy}
          loadingLabel="Đang xử lý..."
          disabled={!form.canSubmit}
          onPress={form.handlePressSave}
        />
      </View>

      <ConfirmModal
        visible={form.confirmVisible}
        title="Lưu thay đổi?"
        message="Thông tin cá nhân của bạn sẽ được cập nhật theo nội dung vừa chỉnh sửa."
        confirmLabel="Lưu thay đổi"
        cancelLabel="Kiểm tra lại"
        onConfirm={form.handleConfirmSave}
        onCancel={form.handleCancelConfirm}
      />
    </KeyboardAvoidingView>
  );
}
