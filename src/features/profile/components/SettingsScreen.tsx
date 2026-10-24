import { useTranslation } from "react-i18next";

import { LanguageSettings } from "@/features/language/LanguageSettings";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { AppearanceSettings } from "@/features/theme/AppearanceSettings";
import { Feather } from "@expo/vector-icons";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsScreenProps = {
  onBack: () => void;
  pushEnabled: boolean;
  pushDisabled: boolean;
  onTogglePush: (value: boolean) => void;
};

export function SettingsScreen({
  onBack,
  pushEnabled,
  pushDisabled,
  onTogglePush,
}: SettingsScreenProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-row items-center px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={tr("Quay lại")}
          className="bg-surface-muted items-center justify-center mr-3"
          style={{ width: 44, height: 44, borderRadius: 12 }}
        >
          <Feather name="arrow-left" size={19} color={COLORS.inkSoft} />
        </TouchableOpacity>
        <Text className="text-ink font-bold" style={{ fontSize: 24, lineHeight: 32 }}>{tr("Cài đặt")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
        <AppearanceSettings />
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2.5" style={{ marginTop: 24 }}>{tr("Tùy chọn ứng dụng")}</Text>
        <View className="bg-surface overflow-hidden" style={{ borderRadius: 20 }}>
          <View className="flex-row items-center px-4 py-4">
            <View className="bg-surface-muted items-center justify-center mr-3" style={{ width: 38, height: 38, borderRadius: 12 }}>
              <Feather name="bell" size={18} color={COLORS.inkSoft} />
            </View>
            <View className="flex-1 mr-2">
              <Text className="text-ink text-[15px] font-bold">
                {tr("Thông báo đẩy")}</Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                {tr("Cập nhật lịch làm và công việc của bạn")}</Text>
            </View>
            <Switch
              accessibilityLabel={tr("Thông báo đẩy")}
              value={pushEnabled}
              disabled={pushDisabled}
              onValueChange={onTogglePush}
              trackColor={{ true: COLORS.primaryFill, false: COLORS.line }}
              thumbColor={COLORS.white}
            />
          </View>
          <View className="h-px bg-line" style={{ marginLeft: 66, marginRight: 16 }} />
          <LanguageSettings />
        </View>
        <View className="items-center" style={{ marginTop: 34 }}>
          <Text className="text-primary text-sm font-semibold">CleanWise</Text>
          <Text className="text-ink-soft text-xs mt-1">{tr("Ứng dụng dành cho nhân viên")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
