import { Feather } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

type PrimaryButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
};

export function PrimaryButton({
  label,
  loading,
  loadingLabel,
  icon,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className="bg-[#2563EB] rounded-2xl py-4 flex-row justify-center items-center"
      disabled={disabled || loading}
      style={{ opacity: disabled || loading ? 0.7 : 1 }}
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
          <Text className="text-white font-semibold text-[15px] mr-2">
            {label}
          </Text>
          {icon && <Feather name={icon} size={17} color="#fff" />}
        </>
      )}
    </TouchableOpacity>
  );
}
