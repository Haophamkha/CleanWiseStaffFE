import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { ChatAvatar } from "@/features/chat/components/ChatAvatar";
import type { ChatListItem } from "@/features/chat/hooks/useChatRoom";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type MessageItemProps = {
  item: ChatListItem;
  otherAvatar?: string | null;
  onToggleMeta: (id: number) => void;
  onRetry: (id: number, text: string) => void;
};

const BIG = 20;
const TIGHT = 6;

export function MessageItem({
  item,
  otherAvatar,
  onToggleMeta,
  onRetry,
}: MessageItemProps) {
  if (item.kind === "day") {
    return (
      <View className="items-center my-3">
        <View className="rounded-full bg-accent-light px-3 py-1">
          <Text className="text-xs font-semibold text-accent-dark">
            {item.label}
          </Text>
        </View>
      </View>
    );
  }

  if (item.kind === "system") {
    return (
      <View className="px-4 my-3 items-center">
        <View
          className="bg-surface border border-line overflow-hidden"
          style={[
            { width: "88%", maxWidth: 440, borderRadius: RADIUS.card },
            SHADOWS.card,
          ]}
        >
          <View className="px-4 py-3 bg-accent-light flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
              <Feather name="bell" size={15} color={COLORS.ink} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-extrabold text-ink">
                {item.title}
              </Text>
              {!!item.assignment && (
                <Text className="text-xs text-ink-soft mt-0.5">
                  {item.assignment}
                </Text>
              )}
            </View>
          </View>
          <View className="px-4 py-4">
            <Text className="text-[15px] leading-6 text-ink">{item.text}</Text>
          </View>
          <View className="px-4 py-2 border-t border-line">
            <Text className="text-xs text-ink-muted">{item.timeLabel}</Text>
          </View>
        </View>
      </View>
    );
  }

  const corners = item.mine
    ? {
        borderTopLeftRadius: BIG,
        borderBottomLeftRadius: BIG,
        borderTopRightRadius: item.joinsOlder ? TIGHT : BIG,
        borderBottomRightRadius: item.joinsNewer ? TIGHT : BIG,
      }
    : {
        borderTopRightRadius: BIG,
        borderBottomRightRadius: BIG,
        borderTopLeftRadius: item.joinsOlder ? TIGHT : BIG,
        borderBottomLeftRadius: item.joinsNewer ? TIGHT : BIG,
      };

  return (
    <View className={`px-4 ${item.joinsOlder ? "mb-0.5" : "mb-2"}`}>
      <View
        className={`flex-row items-end ${item.mine ? "justify-end" : "justify-start"}`}
      >
        {!item.mine && (
          <View className="w-8 mr-2">
            {item.showAvatar && <ChatAvatar uri={otherAvatar} size={32} />}
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onToggleMeta(item.id)}
          className={`max-w-[78%] px-4 py-2.5 ${
            item.mine ? "bg-ink" : "bg-surface border border-line"
          }`}
          style={corners}
        >
          <Text
            className={`text-[15px] leading-5 ${item.mine ? "text-white" : "text-ink"}`}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      </View>

      {item.showMeta && (
        <View
          className={item.mine ? "items-end" : "items-start"}
          style={item.mine ? undefined : { marginLeft: 40 }}
        >
          <TouchableOpacity
            onPress={() => onRetry(item.id, item.text)}
            disabled={!item.failed}
            className="mt-1 mx-1"
          >
            <Text
              className={`text-[11px] ${item.failed ? "text-danger font-semibold" : "text-ink-muted"}`}
            >
              {item.metaText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
