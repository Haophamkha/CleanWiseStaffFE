import NotificationItem from "@/components/notification/NotificationItem";
import {
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation,
} from "@/services/notificationApi";
import { AppNotification } from "@/types/Notification";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<AppNotification[]>([]);

  const { data, isFetching, isLoading, refetch } = useGetNotificationsQuery({
    page,
    page_size: 20,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const items = page === 1 ? (data?.results ?? []) : accumulated;

  const handleLoadMore = () => {
    if (data?.has_next && !isFetching) {
      setAccumulated([
        ...(page === 1 ? data.results : accumulated),
        ...(data.results ?? []),
      ]);
      setPage((p) => p + 1);
    }
  };

  const handlePressNotification = (notification: AppNotification) => {
    if (!notification.is_read) markRead(notification.id);
    if (notification.related_booking) {
      router.push({
        pathname: "/jobs/[id]",
        params: { id: String(notification.related_booking), source: "mine" },
      });
    }
  };

  const handleMarkAllRead = () => {
    if (!data?.unread_count) return;
    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      "Đánh dấu toàn bộ thông báo là đã đọc?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => markAllRead() },
      ],
    );
  };

  const handleRefresh = () => {
    setPage(1);
    setAccumulated([]);
    refetch();
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center justify-between px-5 pb-4 bg-white border-b border-[#F3F4F6]"
      >
        <Feather
          name="arrow-left"
          size={22}
          color="#111827"
          onPress={() => router.back()}
        />
        <Text className="text-[#111827] text-lg font-bold">Thông báo</Text>
        <Text
          onPress={handleMarkAllRead}
          className={`text-sm font-semibold ${
            data?.unread_count ? "text-[#2563EB]" : "text-[#D1D5DB]"
          }`}
        >
          Đọc tất cả
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handlePressNotification}
          />
        )}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator className="my-4" color="#2563EB" />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center mt-24">
              <Feather name="bell-off" size={40} color="#D1D5DB" />
              <Text className="text-[#9CA3AF] mt-3">
                Không có thông báo nào
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
