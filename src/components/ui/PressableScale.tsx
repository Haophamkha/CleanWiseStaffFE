import { useRef, type ReactNode } from "react";
import {
    Animated,
    Pressable,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";

type PressableScaleProps = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  className?: string;
  /** Style của Pressable bên trong */
  style?: StyleProp<ViewStyle>;
  /** Style của khung ngoài (flex, margin...) */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

/** Pressable co lại nhẹ khi nhấn, nảy lại khi thả. */
export function PressableScale({
  children,
  className,
  style,
  containerStyle,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      damping: 15,
      stiffness: 320,
    }).start();

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        className={className}
        style={style}
        onPressIn={(e) => {
          animateTo(scaleTo);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          animateTo(1);
          onPressOut?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
