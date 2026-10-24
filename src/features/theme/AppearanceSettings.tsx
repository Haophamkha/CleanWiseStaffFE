import { useTranslation } from "react-i18next";
import { APP_THEMES } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme, type ThemePreference } from "./ThemeProvider";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
];

export function AppearanceSettings() {
  const { t } = useTranslation();

  const { preference, setPreference, COLORS } = useAppTheme();
  return (
    <View>
      <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2.5">{t("Cá nhân hóa")}</Text>
      <View className="bg-surface p-4" style={{ borderRadius: 20 }}>
        <View className="flex-row items-center">
          <View className="h-10 w-10 bg-primary-soft items-center justify-center mr-3" style={{ borderRadius: 12 }}>
            <Feather name="sliders" size={18} color={COLORS.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink">{t("Giao diện")}</Text>
            <Text className="text-xs text-ink-soft mt-0.5">{t("Chọn phong cách bạn yêu thích")}</Text>
          </View>
        </View>
        <View className="flex-row mt-4" style={{ gap: 12 }} accessibilityRole="radiogroup" accessibilityLabel={t("Chọn giao diện ứng dụng")}>
          {OPTIONS.map((option) => {
            const selected = option.value === preference;
            const preview = APP_THEMES[option.value].COLORS;
            return (
              <TouchableOpacity key={option.value} accessibilityRole="radio" accessibilityLabel={t(option.label)}
                accessibilityState={{ checked: selected }} aria-checked={selected} activeOpacity={0.75}
                onPress={() => {
                  setPreference(option.value).catch(() => Alert.alert(t("Chưa lưu được giao diện"), t("Giao diện đã được đổi. Vui lòng chọn lại khi bộ nhớ thiết bị sẵn sàng để lưu cho lần mở sau.")));
                }}
                className={`flex-1 border p-2.5 ${selected ? "border-primary bg-primary-soft" : "border-line"}`} style={{ borderRadius: 14 }}>
                <View className="p-2" style={{ height: 70, borderRadius: 8, backgroundColor: preview.canvas }}>
                  <View className="mb-2" style={{ height: 7, width: "43%", borderRadius: 3, backgroundColor: option.value === "dark" ? preview.primary : preview.inkMuted }} />
                  <View style={{ height: 30, borderRadius: 5, backgroundColor: option.value === "dark" ? preview.surfaceMuted : preview.surface }} />
                </View>
                <View className="flex-row items-center justify-between mt-2.5">
                  <Text className={`text-xs ${selected ? "text-primary" : "text-ink-soft"}`}>{t(option.label)}</Text>
                  <Feather name={selected ? "check" : "circle"} size={15} color={selected ? COLORS.primary : COLORS.inkMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text className="text-xs text-ink-muted mt-3">
          {preference === "dark" ? t("Nền than dịu mắt, điểm nhấn đỏ hồng.") : t("Nền sáng thoáng, điểm nhấn đỏ CleanWise.")}
        </Text>
      </View>
    </View>
  );
}
