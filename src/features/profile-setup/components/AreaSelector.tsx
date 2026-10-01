import { COLORS, TYPE } from "@/constants/theme";
import { SearchBox } from "@/features/profile-setup/components/SetupKit";
import type { AreaSelectionState } from "@/features/profile-setup/hooks/useAreaSelection";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

/** Phần cố định phía trên: ô tìm, tỉnh đang chọn, nút chọn tất cả. */
export function AreaSelectorTop({ area }: { area: AreaSelectionState }) {
  if (area.step === "province") {
    return (
      <SearchBox
        value={area.search}
        onChangeText={area.setSearch}
        placeholder="Tìm tỉnh/thành..."
      />
    );
  }

  return (
    <View>
      <View
        className="flex-row items-center bg-surface border border-line rounded-2xl px-4 mb-3"
        style={{ minHeight: 48 }}
      >
        <Feather name="map-pin" size={16} color={COLORS.primary} />
        <Text
          className="flex-1 text-ink text-[15px] ml-2.5"
          style={TYPE.label}
          numberOfLines={1}
        >
          {area.provinceName || "Tỉnh/thành đã chọn"}
        </Text>
        <TouchableOpacity
          onPress={area.changeProvince}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Đổi tỉnh/thành"
        >
          <Text className="text-primary text-sm" style={TYPE.label}>
            Đổi
          </Text>
        </TouchableOpacity>
      </View>

      <SearchBox
        value={area.search}
        onChangeText={area.setSearch}
        placeholder="Tìm phường/xã..."
      />

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-ink-soft text-sm">
          Đã chọn{" "}
          <Text className="text-ink font-extrabold">{area.selectedCount}</Text>{" "}
          phường/xã
        </Text>
        <TouchableOpacity
          onPress={area.toggleAllVisible}
          disabled={area.wards.length === 0}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text
            className={`text-sm ${
              area.wards.length === 0 ? "text-ink-muted" : "text-ink"
            }`}
            style={TYPE.label}
          >
            {area.allVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Danh sách tỉnh hoặc phường, đặt trong vùng cuộn. */
export function AreaSelectorList({ area }: { area: AreaSelectionState }) {
  if (area.isLoading) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (area.step === "province") {
    return (
      <View style={{ rowGap: 10 }}>
        {area.provinces.map((p) => (
          <TouchableOpacity
            key={p.province_code}
            onPress={() => area.selectProvince(p.province_code)}
            activeOpacity={0.8}
            accessibilityRole="button"
            className="flex-row items-center justify-between bg-surface border border-line rounded-2xl px-4"
            style={{ minHeight: 52 }}
          >
            <Text className="flex-1 text-ink text-[15px]" style={TYPE.label}>
              {p.city}
            </Text>
            <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
          </TouchableOpacity>
        ))}
        {area.provinces.length === 0 ? (
          <EmptyText text="Không tìm thấy tỉnh/thành." />
        ) : null}
      </View>
    );
  }

  return (
    <View>
      <View
        className="flex-row flex-wrap justify-between"
        style={{ rowGap: 10 }}
      >
        {area.wards.map((w) => (
          <TouchableOpacity
            key={w.id}
            onPress={() => area.toggleArea(w.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: w.selected }}
            style={{ width: "48.5%", minHeight: 48 }}
            className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
              w.selected ? "border-ink bg-ink" : "border-line bg-surface"
            }`}
          >
            <Text
              className={`flex-1 text-[14px] ${
                w.selected ? "text-white" : "text-ink"
              }`}
              style={TYPE.label}
              numberOfLines={1}
            >
              {w.name}
            </Text>
            {w.selected ? (
              <Feather
                name="check-circle"
                size={16}
                color={COLORS.white}
                style={{ marginLeft: 6 }}
              />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
      {area.wards.length === 0 ? (
        <EmptyText text="Không tìm thấy phường/xã." />
      ) : null}
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <Text className="text-ink-muted text-center text-sm mt-6">{text}</Text>
  );
}
