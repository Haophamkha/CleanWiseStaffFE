import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-8 h-8 rounded-full bg-accent-light items-center justify-center mr-3">
        <Feather name={icon} size={14} color={COLORS.accentDark} />
      </View>
      <View className="flex-1">
        <Text className="text-ink-muted text-xs mb-0.5">{label}</Text>
        <Text className="text-ink text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}
