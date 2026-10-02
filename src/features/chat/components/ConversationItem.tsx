import { COLORS } from "@/constants/theme";
import { ChatAvatar } from "@/features/chat/components/ChatAvatar";
import type { ChatInboxRow } from "@/features/chat/hooks/useChatInbox";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

type ConversationItemProps = {
  row: ChatInboxRow;
  onPress: (id: number) => void;
  /** Thứ tự trong danh sách, dùng để xếp so le animation */
  index?: number;
};

export function ConversationItem({
  row,
  onPress,
  index = 0,
}: ConversationItemProps) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index, 8) * 45,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, v]);

  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          {
            translateX: v.interpolate({
              inputRange: [0, 1],
              outputRange: [28, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={() => onPress(row.id)}
        accessibilityRole="button"
        accessibilityLabel={`Mở cuộc trò chuyện với ${row.name}`}
        style={({ pressed }) => ({
          backgroundColor: pressed ? COLORS.canvas : COLORS.surface,
        })}
      >
        <View
          className="flex-row items-center px-5 py-3"
          style={{ minHeight: 76 }}
        >
          <View className="mr-3.5">
            <ChatAvatar uri={row.avatar} size={52} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text
                numberOfLines={1}
                className={`flex-1 mr-2 text-base text-ink ${
                  row.unread ? "font-extrabold" : "font-semibold"
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
              <Text
                numberOfLines={1}
                className="text-[11px] font-semibold text-ink-muted mt-0.5"
              >
                {row.bookingCode}
              </Text>
            )}

            <View className="flex-row items-center mt-1">
              <Text
                numberOfLines={1}
                className={`flex-1 mr-2 text-sm ${
                  row.unread ? "font-semibold text-ink" : "text-ink-soft"
                }`}
              >
                {row.preview}
              </Text>
              {row.unread && (
                <View className="min-w-5 h-5 rounded-full bg-ink px-1.5 items-center justify-center">
                  <Text className="text-white text-[11px] font-bold">
                    {row.unreadLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
