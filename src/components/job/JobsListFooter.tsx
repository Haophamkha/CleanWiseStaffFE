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
  if (isLoadingMore) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }
  if (isError && hasItems) {
    return (
      <Pressable onPress={onRetry} className="py-4 items-center">
        <Text className="text-[#6B7280] text-sm">Không tải thêm được.</Text>
        <Text className="text-[#2563EB] text-sm font-semibold mt-0.5">
          Thử lại
        </Text>
      </Pressable>
    );
  }
  if (!hasNext && hasItems) {
    return (
      <Text className="text-[#9CA3AF] text-xs text-center py-4">
        Đã hiển thị tất cả
      </Text>
    );
  }
  return null;
}
