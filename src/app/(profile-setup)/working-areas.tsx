import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { WorkingAreasPicker } from "@/features/profile-setup/components/WorkingAreasPicker";
import { useWorkingAreas } from "@/features/profile-setup/hooks/useWorkingAreas";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkingAreasScreen() {
  const insets = useSafeAreaInsets();
  const form = useWorkingAreas();

  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader title="Khu vực hoạt động" />

      <WorkingAreasPicker form={form} />

      <View
        className="px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <PrimaryButton
          label="Lưu thay đổi"
          variant="primary"
          loading={form.isSaving}
          loadingLabel="Đang lưu..."
          disabled={!form.canSave}
          onPress={form.handleSave}
        />
      </View>
    </View>
  );
}
