import { RADIUS, SHADOWS } from "@/constants/theme";
import { ChatAvatar } from "@/features/chat/components/ChatAvatar";
import type { ChatInboxRow } from "@/features/chat/hooks/useChatInbox";
import { Pressable, Text, View } from "react-native";

type ConversationItemProps = {
  row: ChatInboxRow;
  onPress: (id: number) => void;
};

export function ConversationItem({ row, onPress }: ConversationItemProps) {
  return (
    <Pressable
      onPress={() => onPress(row.id)}
      className={`flex-row items-center p-4 mb-3 border ${
        row.unread
          ? "bg-primary-soft border-primary-border"
          : "bg-surface border-line"
      }`}
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="mr-3">
        <ChatAvatar uri={row.avatar} size={56} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`flex-1 mr-2 text-base text-ink ${
              row.unread ? "font-extrabold" : "font-bold"
            }`}
          >
            {row.name}
          </Text>
          {!!row.timeLabel && (
            <Text
              className={`text-xs ${
                row.unread ? "text-ink font-semibold" : "text-ink-muted"
              }`}
            >
              {row.timeLabel}
            </Text>
          )}
        </View>

        {!!row.bookingCode && (
          <View className="self-start rounded-full bg-accent-light px-2.5 py-0.5 mt-1">
            <Text className="text-xs font-semibold text-accent-dark">
              {row.bookingCode}
            </Text>
          </View>
        )}

        <View className="flex-row items-center mt-1.5">
          <Text
            numberOfLines={1}
            className={`flex-1 mr-2 text-sm ${
              row.unread ? "font-semibold text-ink" : "text-ink-soft"
            }`}
          >
            {row.preview}
          </Text>
          {row.unread && (
            <View className="min-w-5 h-5 rounded-full bg-primary px-1.5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {row.unreadLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
