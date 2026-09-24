import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import { clearAuth } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { storage } from "@/utils/storage";
import { showErrorToast } from "@/utils/toast";
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

const STATUS_LABEL: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  DRAFT: {
    label: "Chưa hoàn tất hồ sơ",
    color: "#DC2626",
  },

  PENDING: {
    label: "Đang chờ duyệt",
    color: "#D97706",
  },

  ACTIVE: {
    label: "Đang làm việc",
    color: "#22C55E",
  },

  REJECTED: {
    label: "Hồ sơ bị từ chối",
    color: "#DC2626",
  },

  SUSPENDED: {
    label: "Tạm khóa",
    color: "#DC2626",
  },
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

    onPress: () => router.push("/(profile-setup)/working-areas"),
  },

  {
    icon: "credit-card",
    label: "Tài khoản ngân hàng",

    onPress: () => router.push("/payment-methods" as any),
  },

  {
    icon: "dollar-sign",
    label: "Thu nhập",

    onPress: () => router.push("/earnings" as any),
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

  /**
   * =========================
   * LOGOUT
   * =========================
   *
   * Thứ tự quan trọng: dọn Redux + cache RTK Query TRƯỚC, xóa token
   * trong storage SAU.
   *
   * Lý do đổi thứ tự so với trước: nếu để storage.deleteItem() chạy
   * trước mà nó ném lỗi (vd AsyncStorage lỗi tạm thời), try/catch sẽ
   * chặn luôn 2 dòng dispatch phía dưới không bao giờ chạy tới -> Redux
   * vẫn giữ user cũ, cache vẫn còn -> lần đăng nhập kế tiếp thấy nhầm
   * dữ liệu tài khoản cũ. Dọn Redux/cache trước thì dù storage có lỗi,
   * state trong app vẫn sạch; token cũ tối đa chỉ còn sót lại trong
   * storage, không gây hiển thị sai dữ liệu.
   */
  const handleLogout = async () => {
    // 1. Xóa Redux auth
    dispatch(clearAuth());

    // 2. Xóa toàn bộ RTK Query cache (profile, schedules, wallet...)
    dispatch(baseApi.util.resetApiState());

    // 3. Xóa token trong storage — không im lặng nuốt lỗi nữa
    try {
      await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
      await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("[LOGOUT ERROR]", error);
      showErrorToast("Lỗi", "Đăng xuất chưa hoàn tất, vui lòng thử lại.");
    }

    /**
     * Không cần router.replace ở đây.
     * useAuthGuard sẽ thấy:
     *
     * status = unauthenticated
     *
     * và tự chuyển về login.
     */
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
    <View
      className="flex-1 bg-[#F8F9FC]"
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-4">
          <Text className="text-[#111827] text-2xl font-bold">Hồ sơ</Text>

          <Text className="text-[#6B7280] text-sm mt-1">
            Quản lý thông tin tài khoản
          </Text>
        </View>

        {/* Profile card */}
        <View className="mx-5 bg-white rounded-3xl p-5 border border-[#E5E7EB]">
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#2563EB" />

              <Text className="text-[#6B7280] text-sm mt-3">
                Đang tải hồ sơ...
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center py-8">
              <Feather name="alert-circle" size={32} color="#DC2626" />

              <Text className="text-[#DC2626] text-sm mt-3">
                Không thể tải hồ sơ
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center">
                {/* Avatar */}
                <View className="w-20 h-20 rounded-full bg-[#EEF2FF] overflow-hidden items-center justify-center">
                  {avatarUri ? (
                    <Image
                      source={{
                        uri: avatarUri,
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Feather name="user" size={32} color="#2563EB" />
                  )}
                </View>

                {/* Info */}
                <View className="flex-1 ml-4">
                  <Text
                    className="text-[#111827] text-lg font-bold"
                    numberOfLines={1}
                  >
                    {fullName || "Nhân viên"}
                  </Text>

                  <Text
                    className="text-[#6B7280] text-sm mt-1"
                    numberOfLines={1}
                  >
                    {profile?.phone_number ?? ""}
                  </Text>

                  {statusInfo && (
                    <View className="flex-row items-center mt-2">
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor: statusInfo.color,
                        }}
                      />

                      <Text
                        className="text-xs font-medium"
                        style={{
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Rating */}
              <View className="flex-row items-center mt-5 pt-4 border-t border-[#F3F4F6]">
                <Feather name="star" size={16} color="#F59E0B" />

                <Text className="text-[#111827] text-sm font-semibold ml-2">
                  {rating.toFixed(1)}
                </Text>

                <Text className="text-[#9CA3AF] text-sm ml-1">đánh giá</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu */}
        <View className="mx-5 mt-5 bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden">
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              onPress={item.onPress}
              className={`flex-row items-center px-5 py-4 ${
                index !== MENU_ITEMS.length - 1
                  ? "border-b border-[#F3F4F6]"
                  : ""
              }`}
            >
              <View className="w-10 h-10 rounded-xl bg-[#F3F4F6] items-center justify-center">
                <Feather name={item.icon} size={18} color="#374151" />
              </View>

              <Text className="flex-1 text-[#111827] text-sm font-medium ml-3">
                {item.label}
              </Text>

              {item.onPress && (
                <Feather name="chevron-right" size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          className="mx-5 mt-5 bg-white border border-[#FECACA] rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Feather name="log-out" size={18} color="#DC2626" />

          <Text className="text-[#DC2626] text-sm font-semibold ml-2">
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
