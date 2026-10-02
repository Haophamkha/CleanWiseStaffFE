import { COLORS } from "@/constants/theme";
import {
  AreaSelectorList,
  AreaSelectorTop,
} from "@/features/profile-setup/components/AreaSelector";
import type { WorkingAreasState } from "@/features/profile-setup/hooks/useWorkingAreas";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export function WorkingAreasPicker({ form }: { form: WorkingAreasState }) {
  return (
    <View className="flex-1">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-ink-soft text-[15px] leading-5 mb-4">
          Chọn 1 tỉnh/thành, sau đó chọn các phường/xã bạn có thể nhận việc. Cần
          chọn ít nhất một khu vực.
        </Text>
        {form.isLoading ? null : <AreaSelectorTop area={form.area} />}
      </View>

      {form.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AreaSelectorList area={form.area} />
        </ScrollView>
      )}

      {!!form.error && (
        <View className="flex-row items-start bg-danger-light rounded-2xl p-3.5 mx-5 mb-2">
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
