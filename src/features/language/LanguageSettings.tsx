import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAppLanguage } from "./LanguageProvider";
import { translate, type AppLanguage } from "./i18n";

const OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export function LanguageSettings() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const { COLORS } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  return <View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("Chọn ngôn ngữ ứng dụng")}
      accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} activeOpacity={0.75}
      className="flex-row items-center px-4 py-4">
      <View className="bg-surface-muted items-center justify-center mr-3" style={{ width: 38, height: 38, borderRadius: 12 }}>
        <Feather name="globe" size={18} color={COLORS.inkSoft} />
      </View>
      <Text className="flex-1 text-[15px] font-semibold text-ink">{t("Ngôn ngữ")}</Text>
      <Text className="text-xs text-ink-soft mr-2">{OPTIONS.find(option => option.value === language)?.label}</Text>
      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={15} color={COLORS.inkMuted} />
    </TouchableOpacity>
    {expanded && <View className="px-4 pb-3">
    <View accessibilityRole="radiogroup" accessibilityLabel={t("Chọn ngôn ngữ ứng dụng")}>
      {OPTIONS.map((option) => {
        const selected = language === option.value;
        return <TouchableOpacity key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
          accessibilityState={{ checked: selected }} aria-checked={selected} activeOpacity={0.75}
          onPress={() => {
            setExpanded(false);
            void setLanguage(option.value).catch(() => Alert.alert(translate("Chưa lưu được ngôn ngữ"), translate("Ngôn ngữ đã được đổi. Vui lòng chọn lại để lưu cho lần mở sau.")));
          }}
          className={`flex-row items-center px-3 ${selected ? "bg-primary-soft" : ""}`}
          style={{ minHeight: 44, borderRadius: 10, marginLeft: 50 }}>
          <Text className={`flex-1 mr-3 text-sm ${selected ? "text-primary font-semibold" : "text-ink-soft"}`}>{option.label}</Text>
          {selected && <Feather name="check" size={16} color={COLORS.primary} />}
        </TouchableOpacity>;
      })}
    </View>
  </View>}</View>;
}
