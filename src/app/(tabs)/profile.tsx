import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const MENU_ITEMS: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress?: () => void;
}[] = [
  { icon: "user", label: "Thông tin cá nhân" },
  { icon: "map-pin", label: "Khu vực hoạt động" },
  { icon: "calendar", label: "Lịch làm việc" },
  { icon: "credit-card", label: "Tài khoản ngân hàng" },
  { icon: "folder", label: "Hồ sơ của tôi" },
  { icon: "settings", label: "Cài đặt" },
];

export default function ProfileScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white border-b border-[#F3F4F6]">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-2">
            <Feather name="briefcase" size={14} color="#2563EB" />
          </View>
          <Text className="text-[#2563EB] text-lg font-bold">
            CleanCare Staff
          </Text>
        </View>
        <TouchableOpacity>
          <Feather name="bell" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-5">
        {/* Profile card */}
        <View className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-5">
          <View className="bg-[#EEF2FF] items-center pt-8 pb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-3">
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=47" }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View className="flex-row items-center bg-white rounded-full px-3 py-1.5">
              <View className="w-2 h-2 rounded-full bg-[#22C55E] mr-1.5" />
              <Text className="text-[#15803D] text-xs font-semibold">
                Đang làm việc
              </Text>
            </View>
          </View>

          <View className="items-center px-6 py-6">
            <Text className="text-[#111827] text-xl font-bold mb-1">
              Nguyễn Thị Lan
            </Text>
            <View className="flex-row items-center mb-5">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text className="text-[#111827] text-sm font-medium ml-1 mr-2">
                4.9
              </Text>
              <Text className="text-[#9CA3AF] text-sm">•</Text>
              <Text className="text-[#6B7280] text-sm ml-2">
                128 đơn hoàn thành
              </Text>
            </View>

            <TouchableOpacity className="flex-row items-center bg-[#2563EB] rounded-full px-6 py-3">
              <Feather
                name="edit-2"
                size={15}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-[14px]">
                Chỉnh sửa hồ sơ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu list */}
        <View className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-5">
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center justify-between px-5 py-4 ${
                idx !== MENU_ITEMS.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
              onPress={item.onPress}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
                  <Feather name={item.icon} size={16} color="#2563EB" />
                </View>
                <Text className="text-[#111827] text-[15px]">{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-3xl border border-[#E5E7EB] px-5 py-4 mb-6"
          onPress={() => router.replace("/(auth)/login")}
        >
          <View className="w-9 h-9 rounded-full bg-[#FEE2E2] items-center justify-center mr-3">
            <Feather name="log-out" size={16} color="#DC2626" />
          </View>
          <Text className="text-[#DC2626] font-semibold text-[15px]">
            Đăng xuất
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-[#9CA3AF] text-xs mb-8">
          Phiên bản 2.4.1
        </Text>
      </View>
    </ScrollView>
  );
}
