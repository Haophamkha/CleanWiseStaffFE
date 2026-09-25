import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

export function CustomerHeader({
  avatar,
  name,
}: {
  avatar: string | null;
  name: string;
}) {
  return (
    <View className="flex-row items-center">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
      ) : (
        <View className="w-11 h-11 rounded-full bg-[#EEF2FF] items-center justify-center">
          <Feather name="user" size={18} color="#2563EB" />
        </View>
      )}
      <View className="ml-3">
        <Text className="text-[#9CA3AF] text-xs mb-0.5">Khách đặt đơn</Text>
        <Text className="text-[#111827] text-sm font-bold">{name}</Text>
      </View>
    </View>
  );
}
