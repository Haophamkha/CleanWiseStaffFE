import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS, ON_DARK, RADIUS } from "@/constants/theme";
import { ChatAvatar } from "@/features/chat/components/ChatAvatar";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { useChatRoom } from "@/features/chat/hooks/useChatRoom";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function ChatRoom({
  id,
  staff = false,
}: {
  id: number;
  assignmentId?: number;
  staff?: boolean;
}) {
  const room = useChatRoom(id);
  const { conversation } = room;

  if (room.status === "loading")
    return (
      <View className="flex-1 justify-center bg-canvas">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );

  if (room.status === "error" || !conversation)
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-5">
        <EmptyState
          icon="alert-circle"
          title="Không mở được cuộc trò chuyện"
          actionLabel="Quay lại"
          onAction={room.goBack}
        />
      </View>
    );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="bg-ink px-5 pb-4 flex-row items-center"
        style={{
          paddingTop: room.topInset + 8,
          borderBottomLeftRadius: RADIUS.card,
          borderBottomRightRadius: RADIUS.card,
        }}
      >
        <TouchableOpacity
          onPress={room.goBack}
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: ON_DARK.surface }}
        >
          <Feather name="arrow-left" size={20} color={ON_DARK.text} />
        </TouchableOpacity>
        <View
          className="rounded-full mr-3"
          style={{ borderWidth: 2, borderColor: ON_DARK.border }}
        >
          <ChatAvatar uri={conversation.other_user.avatar} size={40} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-extrabold"
            style={{ color: ON_DARK.text }}
            numberOfLines={1}
          >
            {conversation.other_user.name}
          </Text>
          <Text className="text-xs" style={{ color: ON_DARK.textSoft }}>
            {staff ? "Khách hàng" : "Nhân viên phụ trách"}
          </Text>
        </View>
      </View>

      <FlatList
        ref={room.list}
        inverted
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        data={room.items}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <MessageItem
            item={item}
            otherAvatar={conversation.other_user.avatar}
            onToggleMeta={room.toggleMeta}
            onRetry={room.retryMessage}
          />
        )}
        onScroll={room.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 12,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          room.otherTyping ? (
            <TypingIndicator avatar={conversation.other_user.avatar} />
          ) : null
        }
        ListFooterComponent={
          room.cursor ? (
            <TouchableOpacity
              onPress={room.loadOlder}
              disabled={room.loadingMessages}
              className="self-center rounded-full bg-surface border border-line px-4 py-2 my-2"
            >
              <Text className="text-xs font-semibold text-ink">
                {room.loadingMessages ? "Đang tải..." : "Xem tin nhắn cũ"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          room.loaded ? (
            <View className="flex-1 items-center justify-center px-6">
              {room.messageError ? (
                <EmptyState
                  icon="alert-circle"
                  title="Không tải được tin nhắn"
                  actionLabel="Thử lại"
                  onAction={room.reload}
                />
              ) : (
                <EmptyState icon="message-circle" title="Chưa có tin nhắn" />
              )}
            </View>
          ) : (
            <ActivityIndicator color={COLORS.primary} />
          )
        }
        onContentSizeChange={room.onContentSizeChange}
      />

      <ChatComposer
        canSend={room.canSend}
        draft={room.draft}
        hasDraft={room.hasDraft}
        bottomPadding={room.bottomPadding}
        onChange={room.updateDraft}
        onBlur={room.stopTyping}
        onSend={room.sendDraft}
      />
    </KeyboardAvoidingView>
  );
}
