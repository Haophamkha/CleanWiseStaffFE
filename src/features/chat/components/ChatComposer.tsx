import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type ChatComposerProps = {
  canSend: boolean;
  draft: string;
  hasDraft: boolean;
  bottomPadding: number;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSend: () => void;
};

export function ChatComposer({
  canSend,
  draft,
  hasDraft,
  bottomPadding,
  onChange,
  onBlur,
  onSend,
}: ChatComposerProps) {
  if (!canSend) {
    return (
      <View
        className="bg-surface border-t border-line px-5 pt-4"
        style={{ paddingBottom: bottomPadding }}
      >
        <Text className="text-center text-sm text-ink-soft">
          Lịch này đã kết thúc, bạn vẫn có thể xem lịch sử trò chuyện.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="bg-surface border-t border-line px-4 flex-row items-end"
      style={{ paddingTop: 12, paddingBottom: bottomPadding }}
    >
      <TextInput
        value={draft}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor={COLORS.inkMuted}
        multiline
        maxLength={2000}
        className="flex-1 bg-canvas border border-line rounded-3xl px-4 mr-2 max-h-28 text-ink"
        style={{ minHeight: 44, paddingVertical: 12 }}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!hasDraft}
        className={`w-11 h-11 rounded-full items-center justify-center ${
          hasDraft ? "bg-ink" : "bg-line"
        }`}
      >
        <Feather
          name="send"
          size={17}
          color={hasDraft ? COLORS.white : COLORS.inkMuted}
        />
      </TouchableOpacity>
    </View>
  );
}
