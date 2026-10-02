import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS } from "@/constants/theme";
import { ChatAvatar } from "@/features/chat/components/ChatAvatar";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { useChatRoom } from "@/features/chat/hooks/useChatRoom";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** Theo dõi bàn phím để bỏ phần đệm đáy (safe area) khi bàn phím đang mở. */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s = Keyboard.addListener(showEvt, () => setOpen(true));
    const h = Keyboard.addListener(hideEvt, () => setOpen(false));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);
  return open;
}

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
  const keyboardOpen = useKeyboardOpen();

  if (room.status === "loading")
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );

  if (room.status === "error" || !conversation)
    return (
      <View className="flex-1 items-center justify-center bg-surface px-5">
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
      className="flex-1 bg-surface"
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        className="bg-surface border-b border-line pl-2 pr-5 pb-3 flex-row items-center"
        style={{ paddingTop: room.topInset + 8 }}
      >
        <PressableScale
          onPress={room.goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="w-11 h-11 items-center justify-center"
        >
          <Feather name="chevron-left" size={28} color={COLORS.ink} />
        </PressableScale>

        <View className="mx-2">
          <ChatAvatar uri={conversation.other_user.avatar} size={42} />
        </View>

        <View className="flex-1">
          <Text className="text-base font-extrabold text-ink" numberOfLines={1}>
            {conversation.other_user.name}
          </Text>
          <Text className="text-xs text-ink-muted mt-0.5">
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
              activeOpacity={0.8}
              className="self-center flex-row items-center rounded-full bg-accent-light px-4 py-2 my-3"
            >
              {room.loadingMessages ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Feather name="clock" size={13} color={COLORS.inkSoft} />
              )}
              <Text className="text-xs font-semibold text-ink ml-2">
                {room.loadingMessages ? "Đang tải..." : "Xem tin nhắn cũ"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6">
            {!room.loaded ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : room.messageError ? (
              <EmptyState
                icon="alert-circle"
                title="Không tải được tin nhắn"
                actionLabel="Thử lại"
                onAction={room.reload}
              />
            ) : (
              <EmptyState
                icon="message-circle"
                title="Chưa có tin nhắn"
                message="Hãy gửi lời chào đầu tiên."
              />
            )}
          </View>
        }
        onContentSizeChange={room.onContentSizeChange}
      />

      <ChatComposer
        canSend={room.canSend}
        draft={room.draft}
        hasDraft={room.hasDraft}
        bottomPadding={keyboardOpen ? 10 : room.bottomPadding}
        onChange={room.updateDraft}
        onBlur={room.stopTyping}
        onSend={room.sendDraft}
      />
    </KeyboardAvoidingView>
  );
}
