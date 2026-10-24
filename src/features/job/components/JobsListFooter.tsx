import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

export function JobsListFooter({
  isLoadingMore,
  isError,
  hasNext,
  hasItems,
  onRetry,
}: {
  isLoadingMore: boolean;
  isError: boolean;
  hasNext: boolean;
  hasItems: boolean;
  onRetry: () => void;
}) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  if (isLoadingMore) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }
  if (isError && hasItems) {
    return (
      <Pressable
        onPress={onRetry}
        className="py-4 items-center"
        style={{ minHeight: 44 }}
      >
        <Text className="text-ink-soft text-sm">{tr("Không tải thêm được.")}</Text>
        <Text className="text-primary text-sm font-bold mt-0.5">{tr("Thử lại")}</Text>
      </Pressable>
    );
  }
  if (!hasNext && hasItems) {
    return (
      <Text className="text-ink-muted text-xs text-center py-4">
        {tr("Đã hiển thị tất cả")}</Text>
    );
  }
  return null;
}
