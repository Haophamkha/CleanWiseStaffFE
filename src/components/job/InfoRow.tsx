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
      <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
        <Feather name={icon} size={14} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-[#9CA3AF] text-xs mb-0.5">{label}</Text>
        <Text className="text-[#111827] text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}
