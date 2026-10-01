import { TabHeader } from "@/components/common/TabHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { ConversationItem } from "@/features/chat/components/ConversationItem";
import { useChatInbox } from "@/features/chat/hooks/useChatInbox";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

/** Khung chờ khi đang tải danh sách. */
function InboxSkeleton() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View className="pt-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Animated.View
          key={i}
          className="flex-row items-center px-5"
          style={{ height: 76, opacity: pulse }}
        >
          <View className="w-[52px] h-[52px] rounded-full bg-accent-light mr-3.5" />
          <View className="flex-1">
            <View className="h-3.5 w-1/2 rounded-full bg-accent-light mb-2.5" />
            <View className="h-3 w-4/5 rounded-full bg-accent-light" />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

export function ChatInbox(_props: { staff?: boolean }) {
  const inbox = useChatInbox();

  return (
    <View className="flex-1 bg-surface">
      <TabHeader title="Tin nhắn" subtitle={inbox.subtitle} />
      <View className="h-px bg-line" />

      {inbox.status === "guest" ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState icon="lock" title="Đăng nhập để xem tin nhắn" />
        </View>
      ) : inbox.status === "loading" ? (
        <InboxSkeleton />
      ) : inbox.status === "error" ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon="alert-circle"
            title="Không tải được tin nhắn"
            actionLabel="Thử lại"
            onAction={() => {
              void inbox.refresh();
            }}
          />
        </View>
      ) : (
        <FlatList
          data={inbox.rows}
          keyExtractor={(row) => String(row.id)}
          renderItem={({ item, index }) => (
            <ConversationItem
              row={item}
              onPress={inbox.openConversation}
              index={index}
            />
          )}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={inbox.refreshing}
              onRefresh={() => {
                void inbox.refresh();
              }}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={inbox.loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="flex-1 justify-center">
              <EmptyState
                icon="message-circle"
                title="Chưa có cuộc trò chuyện nào"
              />
            </View>
          }
          ListFooterComponent={
            inbox.isFetchingMore ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}
