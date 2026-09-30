import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Modal, Text, View } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** primary = đỏ nổi bật (mặc định) | dark = đen, dùng cho xác nhận thông thường */
  tone?: "primary" | "dark";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Kiểm tra lại",
  loading,
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isPrimary = tone === "primary";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: OVERLAY }}
      >
        <View
          className="bg-surface p-6 w-full items-center"
          style={[{ maxWidth: 360, borderRadius: RADIUS.hero }, SHADOWS.card]}
        >
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
              isPrimary ? "bg-primary-soft" : "bg-accent-light"
            }`}
          >
            <Feather
              name="help-circle"
              size={30}
              color={isPrimary ? COLORS.primary : COLORS.ink}
            />
          </View>

          <Text className="text-ink text-xl font-extrabold text-center mb-1">
            {title}
          </Text>

          {message ? (
            <Text className="text-ink-soft text-sm text-center leading-5">
              {message}
            </Text>
          ) : null}

          <PrimaryButton
            label={confirmLabel}
            variant={tone}
            loading={loading}
            onPress={onConfirm}
            style={{ width: "100%", marginTop: 20 }}
          />
          <PrimaryButton
            label={cancelLabel}
            variant="outline"
            disabled={loading}
            onPress={onCancel}
            style={{ width: "100%", marginTop: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
}
