import { COLORS, RADIUS, TYPE } from "@/constants/theme";
import type { WorkingAreasState } from "@/features/profile-setup/hooks/useWorkingAreas";
import { Feather } from "@expo/vector-icons";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export function WorkingAreasPicker({ form }: { form: WorkingAreasState }) {
  return (
    <View className="flex-1">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-ink-soft text-[15px] leading-5 mb-4">
          Chọn các tỉnh/thành bạn có thể nhận việc. Bạn cần chọn ít nhất một khu
          vực.
        </Text>

        <View
          className="flex-row items-center bg-surface border border-line px-4"
          style={{ height: 48, borderRadius: RADIUS.pill }}
        >
          <Feather name="search" size={17} color={COLORS.inkMuted} />
          <TextInput
            className="flex-1 ml-3 text-ink text-[15px]"
            placeholder="Tìm tỉnh/thành..."
            placeholderTextColor={COLORS.inkMuted}
            value={form.search}
            onChangeText={form.setSearch}
            autoCapitalize="none"
          />
          {form.search.length > 0 && (
            <TouchableOpacity
              onPress={form.clearSearch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Xóa từ khóa tìm kiếm"
            >
              <Feather name="x" size={17} color={COLORS.inkMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center mt-4 ml-1">
          <Text
            className="text-ink-muted text-xs"
            style={[TYPE.label, { letterSpacing: 1 }]}
          >
            ĐÃ CHỌN
          </Text>
          <View className="bg-primary-soft rounded-full px-2.5 py-0.5 ml-2">
            <Text className="text-primary text-xs" style={TYPE.label}>
              {form.selectedCount}
            </Text>
          </View>
        </View>
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
          <View
            className="flex-row flex-wrap justify-between"
            style={{ rowGap: 10 }}
          >
            {form.areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                onPress={() => form.toggleArea(area.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: area.selected }}
                style={{ width: "48.5%", minHeight: 48 }}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                  area.selected ? "border-ink bg-ink" : "border-line bg-surface"
                }`}
              >
                <Text
                  className={`flex-1 text-[14px] ${
                    area.selected ? "text-white" : "text-ink"
                  }`}
                  style={TYPE.label}
                  numberOfLines={1}
                >
                  {area.name}
                </Text>
                {area.selected && (
                  <Feather
                    name="check-circle"
                    size={16}
                    color={COLORS.white}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {form.areas.length === 0 && (
            <View className="items-center mt-10">
              <View className="w-14 h-14 rounded-full bg-accent-light items-center justify-center mb-3">
                <Feather name="map-pin" size={24} color={COLORS.inkMuted} />
              </View>
              <Text className="text-ink-muted text-sm text-center">
                Không tìm thấy khu vực phù hợp.
              </Text>
            </View>
          )}
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
