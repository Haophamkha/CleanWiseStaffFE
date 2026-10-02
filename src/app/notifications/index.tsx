import { COLORS, TYPE } from "@/constants/theme";
import NotificationItem from "@/features/notification/components/NotificationItem";
import { NotificationsHeader } from "@/features/notification/components/NotificationsHeader";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const n = useNotifications();

  return (
    <View className="flex-1 bg-canvas">
      <NotificationsHeader
        unreadCount={n.unreadCount}
        hasItems={n.hasItems}
        onBack={n.handleBack}
        onMarkAllRead={n.handleMarkAllRead}
        onClearAll={n.handleClearAll}
      />

      <FlatList
        data={n.rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={n.isLoading}
            onRefresh={n.handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={n.handleLoadMore}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text
              className="text-ink-muted text-xs mt-3 mb-3 ml-1"
              style={[TYPE.label, { letterSpacing: 1 }]}
            >
              {item.label.toUpperCase()}
            </Text>
          ) : (
            <NotificationItem
              notification={item.notification}
              onPress={n.handlePressNotification}
            />
          )
        }
        ListFooterComponent={
          n.isLoadingMore ? (
            <ActivityIndicator className="my-4" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          !n.isLoading ? (
            <View className="items-center justify-center mt-24 px-8">
              <View className="w-20 h-20 rounded-full bg-accent-light items-center justify-center">
                <Feather name="bell-off" size={30} color={COLORS.accentDark} />
              </View>
              <Text className="text-ink text-lg font-extrabold mt-5">
                Chưa có thông báo
              </Text>
              <Text className="text-ink-soft text-sm text-center mt-1.5 leading-5">
                Thông báo về đơn việc, thanh toán và hệ thống sẽ hiện ở đây.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
