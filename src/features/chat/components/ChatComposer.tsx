import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ChatComposerProps = {
  canSend: boolean;
  draft: string;
  hasDraft: boolean;
  bottomPadding: number;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSend: () => void;
};

const MAX_LENGTH = 2000;
const COUNTER_FROM = 1800;

export function ChatComposer({
  canSend,
  draft,
  hasDraft,
  bottomPadding,
  onChange,
  onBlur,
  onSend,
}: ChatComposerProps) {
  const [focused, setFocused] = useState(false);
  const pop = useRef(new Animated.Value(hasDraft ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: hasDraft ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [hasDraft, pop]);

  if (!canSend) {
    return (
      <View
        className="bg-surface border-t border-line px-5 pt-4 flex-row items-center justify-center"
        style={{ paddingBottom: bottomPadding }}
      >
        <Feather name="lock" size={14} color={COLORS.inkMuted} />
        <Text className="text-sm text-ink-soft ml-2 flex-shrink">
          Lịch này đã kết thúc, bạn vẫn có thể xem lịch sử trò chuyện.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="bg-surface border-t border-line px-3 flex-row items-end"
      style={{ paddingTop: 10, paddingBottom: bottomPadding }}
    >
      <View
        className={`flex-1 bg-accent-light rounded-3xl mr-2 justify-center border ${
          focused ? "border-ink" : "border-transparent"
        }`}
        style={{ minHeight: 44 }}
      >
        <TextInput
          value={draft}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={COLORS.inkMuted}
          multiline
          maxLength={MAX_LENGTH}
          className="px-4 text-ink max-h-28"
          style={{ paddingVertical: 11, fontSize: 15 }}
        />
        {draft.length > COUNTER_FROM ? (
          <Text className="text-[10px] text-ink-muted text-right px-4 pb-1.5">
            {draft.length}/{MAX_LENGTH}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onSend}
        disabled={!hasDraft}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Gửi tin nhắn"
      >
        <Animated.View
          className="w-11 h-11 rounded-full items-center justify-center overflow-hidden"
          style={{
            transform: [
              {
                scale: pop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          }}
        >
          <View className="absolute inset-0 bg-accent-light" />
          <Animated.View
            className="absolute inset-0 bg-ink"
            style={{ opacity: pop }}
          />
          <Feather
            name="send"
            size={17}
            color={hasDraft ? COLORS.white : COLORS.inkMuted}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
