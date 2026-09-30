import { TabHeader } from "@/components/common/TabHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { ConversationItem } from "@/features/chat/components/ConversationItem";
import { useChatInbox } from "@/features/chat/hooks/useChatInbox";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export function ChatInbox(_props: { staff?: boolean }) {
  const inbox = useChatInbox();

  return (
    <View className="flex-1 bg-canvas">
      <TabHeader title="Tin nhắn" subtitle={inbox.subtitle} />

      {inbox.status === "guest" ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState icon="lock" title="Đăng nhập để xem tin nhắn" />
        </View>
      ) : inbox.status === "loading" ? (
        <View className="flex-1 justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
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
          renderItem={({ item }) => (
            <ConversationItem row={item} onPress={inbox.openConversation} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 24,
            flexGrow: 1,
          }}
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
