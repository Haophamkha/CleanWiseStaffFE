import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type PrimaryButtonProps = TouchableOpacityProps & {
  label: string;
  subtitle?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  color?: string;
};

export function PrimaryButton({
  label,
  subtitle,
  loading,
  loadingLabel,
  icon,
  disabled,
  color = "#2563EB",
  style,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: color,
          borderRadius: 18,
          paddingVertical: subtitle ? 14 : 16,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: subtitle ? "flex-start" : "center",
          opacity: disabled || loading ? 0.6 : 1,
          shadowColor: color,
          shadowOpacity: 0.28,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 5,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator color="#fff" />
          {loadingLabel && (
            <Text className="text-white font-semibold text-[15px] ml-2">
              {loadingLabel}
            </Text>
          )}
        </>
      ) : (
        <>
          {icon && (
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Feather name={icon} size={17} color="#fff" />
            </View>
          )}
          <View style={{ flex: subtitle ? 1 : undefined }}>
            <Text className="text-white font-semibold text-[15px]">
              {label}
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
          {subtitle && <Feather name="chevron-right" size={18} color="#fff" />}
        </>
      )}
    </TouchableOpacity>
  );
}
