import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileSetupSuccess() {
  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
    >
      <View className="w-full max-w-[420px] bg-white rounded-[28px] border border-[#E5E7EB] p-8 items-center">
        <View className="w-20 h-20 rounded-full bg-[#EEF2FF] items-center justify-center mb-6">
          <Feather name="check-circle" size={36} color="#2563EB" />
        </View>
        <Text className="text-[#111827] text-2xl font-bold text-center mb-3">
          Hồ sơ đã được gửi thành công
        </Text>
        <View className="bg-[#EEF2FF] rounded-full px-4 py-1.5 mb-4">
          <Text className="text-[#2563EB] text-xs font-semibold">
            • Chờ xét duyệt
          </Text>
        </View>
        <Text className="text-[#6B7280] text-[15px] leading-6 text-center mb-3">
          Cảm ơn bạn đã đăng ký làm nhân viên của CleanCare. Quản trị viên của
          chúng tôi sẽ xem xét hồ sơ của bạn trong vòng{" "}
          <Text className="font-semibold text-[#111827]">24 - 48 giờ</Text>.
        </Text>
        <View className="flex-row items-start bg-[#F8F9FC] rounded-2xl px-4 py-3 mb-8 self-stretch">
          <Feather
            name="bell"
            size={16}
            color="#2563EB"
            style={{ marginTop: 2, marginRight: 8 }}
          />
          <Text className="text-[#374151] text-[13px] leading-5 flex-1">
            Kết quả duyệt hồ sơ sẽ được thông báo trực tiếp ngay trong ứng dụng
            này. Bạn không cần kiểm tra email hay tin nhắn — chỉ cần vào lại mục
            "Hồ sơ của tôi" để xem trạng thái mới nhất.
          </Text>
        </View>

        <TouchableOpacity
          className="w-full flex-row items-center justify-center bg-[#2563EB] rounded-2xl py-4 mb-3"
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Feather
            name="home"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-semibold text-[15px]">
            Về trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full items-center border border-[#2563EB] rounded-2xl py-4"
          onPress={() => router.push("/(profile-setup)/personal-info")}
        >
          <Text className="text-[#2563EB] font-semibold text-[15px]">
            Xem lại hồ sơ
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
