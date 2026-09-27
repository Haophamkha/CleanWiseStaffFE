import { useGetUnreadCountQuery } from "@/services/notificationApi";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function NotificationBellButton() {
  useGetUnreadCountQuery(undefined, {
    refetchOnFocus: true,
    pollingInterval: 15000,
  });
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    refetchOnFocus: true,
  });

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
