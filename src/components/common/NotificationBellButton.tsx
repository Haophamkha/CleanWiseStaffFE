import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useAvailableJobCount } from "@/features/job/hooks/useAvailableJobCount";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export function NotificationBellButton() {
  const { COLORS } = useAppTheme();
  const { t: tr } = useTranslation();
  const count = useAvailableJobCount() ?? 0;

  return (
    <Pressable
      hitSlop={10}
      onPress={() => router.push("/notifications" as any)}
      accessibilityRole="button"
      accessibilityLabel={
        count > 0
          ? tr("Thông báo, {{count}} công việc khả dụng", { count })
          : tr("Thông báo")
      }
      className="relative"
    >
      <Feather name="bell" size={24} color={COLORS.ink} />
      {count > 0 && (
        <View className="absolute -top-1.5 -right-1.5 bg-danger-fill rounded-full min-w-[16px] h-4 items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
