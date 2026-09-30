import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import type {
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";

type FeatherName = ComponentProps<typeof Feather>["name"];

type Variant = {
  icon: FeatherName;
  color: string;
  iconBg: string;
};

const VARIANTS: Record<"success" | "error" | "warning" | "info", Variant> = {
  success: { icon: "check", color: COLORS.success, iconBg: "bg-success-light" },
  error: {
    icon: "alert-circle",
    color: COLORS.danger,
    iconBg: "bg-danger-light",
  },
  warning: {
    icon: "alert-triangle",
    color: COLORS.warning,
    iconBg: "bg-warning-light",
  },
  info: { icon: "info", color: COLORS.info, iconBg: "bg-info-light" },
};

const DEFAULT_DURATION = 4000;

type ToastCardProps = ToastConfigParams<{ duration?: number }> & {
  variant: keyof typeof VARIANTS;
};

function ToastCard({ variant, text1, text2, props, hide }: ToastCardProps) {
  const v = VARIANTS[variant];
  const duration = props?.duration ?? DEFAULT_DURATION;
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.setValue(1);
    const anim = Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [duration, progress, text1, text2]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      className="w-[92%]"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <Pressable
        onPress={() => hide()}
        accessibilityRole="alert"
        className="bg-surface border border-line overflow-hidden"
        style={{ borderRadius: RADIUS.card }}
      >
        <View className="flex-row items-start px-4 py-3.5">
          <View
            className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${v.iconBg}`}
          >
            <Feather name={v.icon} size={18} color={v.color} />
          </View>
          <View className="flex-1 pr-2">
            <Text
              className="text-ink text-[15px]"
              style={TYPE.label}
              numberOfLines={2}
            >
              {text1}
            </Text>
            {!!text2 && (
              <Text
                className="text-ink-soft text-[13px] mt-0.5 leading-[18px]"
                numberOfLines={2}
              >
                {text2}
              </Text>
            )}
          </View>
          <Feather
            name="x"
            size={16}
            color={COLORS.inkMuted}
            style={{ marginTop: 2 }}
          />
        </View>

        {/* Thanh đếm ngược thời gian tự tắt */}
        <View className="h-[3px] bg-transparent">
          <Animated.View
            style={{
              width,
              height: 3,
              backgroundColor: v.color,
              opacity: 0.85,
            }}
          />
        </View>
      </Pressable>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (p) => <ToastCard {...p} variant="success" />,
  error: (p) => <ToastCard {...p} variant="error" />,
  warning: (p) => <ToastCard {...p} variant="warning" />,
  info: (p) => <ToastCard {...p} variant="info" />,
};
