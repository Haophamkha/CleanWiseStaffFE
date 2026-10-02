import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Modal, Pressable, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  pushEnabled: boolean;
  pushDisabled: boolean;
  onTogglePush: (value: boolean) => void;
};

export function SettingsSheet({
  visible,
  onClose,
  pushEnabled,
  pushDisabled,
  onTogglePush,
}: SettingsSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: OVERLAY }}
        onPress={onClose}
      >
        {/* Chặn chạm xuyên xuống lớp nền */}
        <Pressable
          className="bg-canvas px-5 pt-3"
          style={{
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            paddingBottom: insets.bottom + 24,
          }}
          onPress={() => {}}
        >
          <View className="self-center w-10 h-1 rounded-full bg-line mb-4" />

          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-ink text-2xl font-extrabold">Cài đặt</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              className="w-11 h-11 rounded-full bg-surface border border-line items-center justify-center"
            >
              <Feather name="x" size={18} color={COLORS.ink} />
            </Pressable>
          </View>

          <View className="bg-surface border border-line rounded-3xl flex-row items-center px-5 py-4">
            <View className="w-10 h-10 rounded-xl bg-accent-light items-center justify-center">
              <Feather name="bell" size={18} color={COLORS.ink} />
            </View>
            <View className="flex-1 ml-3 mr-2">
              <Text className="text-ink text-[15px] font-bold">
                Thông báo đẩy
              </Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                Tắt vẫn xem được thông báo trong ứng dụng
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              disabled={pushDisabled}
              onValueChange={onTogglePush}
              trackColor={{ true: COLORS.ink, false: COLORS.line }}
              thumbColor={COLORS.white}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
