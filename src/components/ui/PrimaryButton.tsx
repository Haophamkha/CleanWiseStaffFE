import { COLORS, RADIUS, TYPE } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type Variant = "primary" | "dark" | "outline" | "soft";

type PrimaryButtonProps = TouchableOpacityProps & {
  label: string;
  subtitle?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  /** primary = đỏ nổi bật | dark = đen | outline = viền đen | soft = nền da */
  variant?: Variant;
  /** ghi đè màu nền (giữ tương thích code cũ) */
  color?: string;
};

const VARIANTS: Record<
  Variant,
  { bg: string; text: string; border: string; shadow: boolean }
> = {
  primary: {
    bg: COLORS.primary,
    text: COLORS.white,
    border: "transparent",
    shadow: true,
  },
  dark: {
    bg: COLORS.ink,
    text: COLORS.white,
    border: "transparent",
    shadow: true,
  },
  outline: {
    bg: "transparent",
    text: COLORS.ink,
    border: COLORS.ink,
    shadow: false,
  },
  soft: {
    bg: COLORS.accentLight,
    text: COLORS.ink,
    border: "transparent",
    shadow: false,
  },
};

export function PrimaryButton({
  label,
  subtitle,
  loading,
  loadingLabel,
  icon,
  disabled,
  variant = "primary",
  color,
  style,
  ...props
}: PrimaryButtonProps) {
  const v = VARIANTS[variant];
  const bg = color ?? v.bg;
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={inactive}
      style={[
        {
          backgroundColor: bg,
          borderWidth: 1.5,
          borderColor: v.border,
          borderRadius: subtitle ? RADIUS.card : RADIUS.pill,
          paddingVertical: subtitle ? 14 : 15,
          paddingHorizontal: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: subtitle ? "flex-start" : "center",
          opacity: inactive ? 0.55 : 1,
          ...(v.shadow && {
            shadowColor: bg,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }),
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator color={v.text} />
          {loadingLabel && (
            <Text
              className="text-[13px] ml-2"
              style={[TYPE.button, { color: v.text }]}
            >
              {loadingLabel.toUpperCase()}
            </Text>
          )}
        </>
      ) : (
        <>
          {icon && !subtitle && (
            <Feather
              name={icon}
              size={16}
              color={v.text}
              style={{ marginRight: 8 }}
            />
          )}
          <View style={{ flex: subtitle ? 1 : undefined }}>
            <Text
              className="text-[13px]"
              style={[TYPE.button, { color: v.text }]}
            >
              {label.toUpperCase()}
            </Text>
            {subtitle ? (
              <Text
                className="text-[12px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          {subtitle && (
            <Feather name="chevron-right" size={18} color={v.text} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
