import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function NetworkBanner() {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-[#DC2626] px-4 py-2.5 flex-row items-center justify-center">
      <Feather
        name="wifi-off"
        size={14}
        color="#fff"
        style={{ marginRight: 6 }}
      />
      <Text className="text-white text-[13px] font-medium">
        Mất kết nối mạng
      </Text>
    </View>
  );
}
