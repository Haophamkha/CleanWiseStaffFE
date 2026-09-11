import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function MessagesScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-14 pb-4 bg-white border-b border-[#F3F4F6]">
        <Text className="text-[#111827] text-xl font-bold">Tin nhắn</Text>
      </View>

      <View className="flex-1 items-center justify-center py-24">
        <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-4">
          <Feather name="message-circle" size={22} color="#2563EB" />
        </View>
        <Text className="text-[#111827] font-semibold text-base mb-1">
          Chưa có tin nhắn nào
        </Text>
        <Text className="text-[#9CA3AF] text-sm">
          Đang chờ dữ liệu từ Backend
        </Text>
      </View>
    </ScrollView>
  );
}
