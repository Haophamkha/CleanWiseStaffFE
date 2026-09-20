import { ProfileStatusCard } from "@/components/common/ProfileStatusCard";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading } = useGetWorkerProfileQuery();

  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center justify-between px-5 pb-4 bg-white border-b border-[#F3F4F6]"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-2">
            <Feather name="briefcase" size={14} color="#2563EB" />
          </View>
          <Text className="text-[#2563EB] text-lg font-bold">
            CleanCare Staff
          </Text>
        </View>
        <Feather name="bell" size={22} color="#111827" />
      </View>

      {isLoading || !profile ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : (
        <ProfileStatusCard profile={profile} />
      )}

      {profile?.status === "ACTIVE" && (
        <View className="flex-1 items-center justify-center py-24">
          <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-4">
            <Feather name="home" size={22} color="#2563EB" />
          </View>
          <Text className="text-[#111827] font-semibold text-base mb-1">
            Trang chủ
          </Text>
          <Text className="text-[#9CA3AF] text-sm">
            Đang chờ dữ liệu từ Backend
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
