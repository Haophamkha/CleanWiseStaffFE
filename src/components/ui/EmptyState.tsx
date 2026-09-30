import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type EmptyStateProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      className="bg-surface px-6 py-8 items-center border border-line"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="w-[76px] h-[76px] rounded-full bg-primary-soft items-center justify-center mb-4">
        <View className="w-14 h-14 rounded-full bg-primary-light items-center justify-center">
          <Feather name={icon} size={24} color={COLORS.primary} />
        </View>
      </View>
      <Text className="text-ink font-extrabold text-base mb-1 text-center">
        {title}
      </Text>
      {message ? (
        <Text className="text-ink-soft text-sm text-center leading-5">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="flex-row items-center justify-center bg-ink rounded-full px-5 mt-5"
          style={{ height: 44 }}
        >
          <Text className="text-white text-xs" style={TYPE.button}>
            {actionLabel.toUpperCase()}
          </Text>
          <Feather
            name="arrow-right"
            size={14}
            color={COLORS.white}
            style={{ marginLeft: 6 }}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
