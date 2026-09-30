import { useGetUnreadCountQuery } from "@/features/notification/api/notificationApi";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function NotificationBellButton() {
  const user = useAppSelector((s) => s.auth.user);
  // Chỉ lấy số ban đầu; sau đó socket cập nhật slice
  useGetUnreadCountQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: 30,
  });
  const unreadCount = useAppSelector((s) => s.notification.unreadCount);

  return (
    <Pressable
      hitSlop={10}
      onPress={() => router.push("/notifications" as any)}
      className="relative"
    >
      <Feather name="bell" size={24} color="#111827" />
      {unreadCount > 0 && (
        <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
