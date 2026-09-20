import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import { clearAuth } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { storage } from "@/utils/storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Chưa hoàn tất hồ sơ", color: "#DC2626" },
  PENDING: { label: "Đang chờ duyệt", color: "#D97706" },
  ACTIVE: { label: "Đang làm việc", color: "#22C55E" },
  REJECTED: { label: "Hồ sơ bị từ chối", color: "#DC2626" },
  SUSPENDED: { label: "Tạm khóa", color: "#DC2626" },
};

const MENU_ITEMS: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress?: () => void;
}[] = [
  {
    icon: "user",
    label: "Thông tin cá nhân",
    onPress: () => router.push("/(profile-setup)/personal-info"),
  },
  {
    icon: "map-pin",
    label: "Khu vực hoạt động",
    // Màn riêng, không dùng lại bước Area trong wizard vì bước đó có
    // step-progress + tự động gọi submitProfile() (chỉ hợp lệ khi hồ sơ
    // đang DRAFT), gây lỗi "Dữ liệu gửi lên không hợp lệ" khi sửa khu vực
    // của hồ sơ đã ACTIVE.
    onPress: () => router.push("/(profile-setup)/working-areas"),
  },
  {
    icon: "credit-card",
    label: "Tài khoản ngân hàng",
  },
  {
    icon: "folder",
    label: "Hồ sơ của tôi",
    onPress: () => router.push("/(profile-setup)/my-profile"),
  },
  {
    icon: "settings",
    label: "Cài đặt",
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { data: profile, isLoading, isError } = useGetWorkerProfileQuery();

  const handleLogout = async () => {
    await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    dispatch(clearAuth());
    // useAuthGuard ở root layout sẽ tự phát hiện và điều hướng về login.
  };

  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username
    : "";

  const avatarUri = profile?.portrait
    ? profile.portrait.startsWith("http")
      ? profile.portrait
      : `${ENV.API_URL}${profile.portrait}`
    : null;

  const rating = profile?.average_rating ? Number(profile.average_rating) : 0;
  const statusInfo = profile
    ? (STATUS_LABEL[profile.status] ?? {
        label: profile.status,
        color: "#6B7280",
      })
    : null;

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
        <TouchableOpacity>
          <Feather name="bell" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="items-center justify-center py-24">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : isError || !profile ? (
        <View className="items-center justify-center py-24 px-5">
          <Feather name="alert-circle" size={28} color="#DC2626" />
          <Text className="text-[#6B7280] text-sm mt-3 text-center">
            Không tải được thông tin hồ sơ. Vui lòng thử lại sau.
          </Text>
        </View>
      ) : (
        <View className="px-5 pt-5">
          <View className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-5">
            <View className="bg-[#EEF2FF] items-center pt-8 pb-6">
              <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-3 bg-[#E5E7EB] items-center justify-center">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Feather name="user" size={32} color="#9CA3AF" />
                )}
              </View>

              {statusInfo && (
                <View className="flex-row items-center bg-white rounded-full px-3 py-1.5">
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </Text>
                </View>
              )}
            </View>

            <View className="items-center px-6 py-6">
              <Text className="text-[#111827] text-xl font-bold mb-1">
                {fullName}
              </Text>
              <View className="flex-row items-center mb-5">
                <Feather name="star" size={14} color="#F59E0B" />
                <Text className="text-[#111827] text-sm font-medium ml-1 mr-2">
                  {rating > 0 ? rating.toFixed(1) : "Chưa có đánh giá"}
                </Text>
                <Text className="text-[#9CA3AF] text-sm">•</Text>
                <Text className="text-[#6B7280] text-sm ml-2">
                  {profile.total_completed_jobs} đơn hoàn thành
                </Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center bg-[#2563EB] rounded-full px-6 py-3"
                onPress={() => router.push("/(profile-setup)/portrait")}
              >
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

          <View className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-5">
            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                className={`flex-row items-center justify-between px-5 py-4 ${
                  idx !== MENU_ITEMS.length - 1
                    ? "border-b border-[#F3F4F6]"
                    : ""
                }`}
                onPress={item.onPress}
              >
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
                    <Feather name={item.icon} size={16} color="#2563EB" />
                  </View>
                  <Text className="text-[#111827] text-[15px]">
                    {item.label}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="flex-row items-center bg-white rounded-3xl border border-[#E5E7EB] px-5 py-4 mb-6"
            onPress={handleLogout}
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
      )}
    </ScrollView>
  );
}
