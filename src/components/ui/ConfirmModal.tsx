import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  View,
} from "react-native";

type FeatherName = ComponentProps<typeof Feather>["name"];

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** primary = đỏ (mặc định) | dark = đen, xác nhận thông thường | danger = hành động hủy/xóa */
  tone?: "primary" | "dark" | "danger";
  /** Icon trong vòng tròn phía trên */
  icon?: FeatherName;
  /** Nội dung thêm (ví dụ ô nhập ghi chú) nằm giữa lời nhắn và nút */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONES = {
  primary: {
    circle: "bg-primary-soft",
    icon: COLORS.primary,
    variant: "primary" as const,
    color: undefined as string | undefined,
  },
  dark: {
    circle: "bg-accent-light",
    icon: COLORS.ink,
    variant: "dark" as const,
    color: undefined as string | undefined,
  },
  danger: {
    circle: "bg-danger-light",
    icon: COLORS.danger,
    variant: "primary" as const,
    color: COLORS.danger as string | undefined,
  },
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Kiểm tra lại",
  loading,
  tone = "primary",
  icon = "help-circle",
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const t = TONES[tone];
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [visible, enter]);

  const scale = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const opacity = enter.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onCancel}
    >
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: OVERLAY }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          className="bg-surface p-6 w-full items-center"
          style={[
            {
              maxWidth: 360,
              borderRadius: RADIUS.hero,
              opacity,
              transform: [{ translateY }, { scale }],
            },
            SHADOWS.card,
          ]}
        >
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${t.circle}`}
          >
            <Feather name={icon} size={30} color={t.icon} />
          </View>

          <Text className="text-ink text-xl font-extrabold text-center mb-1">
            {title}
          </Text>

          {message ? (
            <Text className="text-ink-soft text-sm text-center leading-5">
              {message}
            </Text>
          ) : null}

          {children ? <View className="w-full mt-4">{children}</View> : null}

          <PrimaryButton
            label={confirmLabel}
            variant={t.variant}
            color={t.color}
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
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
