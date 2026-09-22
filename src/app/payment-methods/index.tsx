import PaymentMethodCard from "@/components/payment/PaymentMethodCard";
import {
  useDeletePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useSetDefaultPaymentMethodMutation,
} from "@/services/paymentMethodApi";
import type { PaymentMethod } from "@/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkerPaymentMethodsScreen() {
  const { data: methods = [], isLoading, isFetching, isError, refetch } =
    useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: isSettingDefault }] = useSetDefaultPaymentMethodMutation();
  const [deleteMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation();
  const isMutating = isSettingDefault || isDeleting;

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await setDefault(method.id).unwrap();
      showSuccessToast("Đã đặt làm tài khoản mặc định");
    } catch {
      showErrorToast("Không thể cập nhật", "Vui lòng thử lại sau.");
    }
  };

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      "Xóa tài khoản",
      `Bạn có chắc muốn xóa ${method.bank_name} ${method.account_number_masked}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMethod(method.id).unwrap();
              showSuccessToast("Đã xóa tài khoản ngân hàng");
            } catch {
              showErrorToast("Không thể xóa", "Vui lòng thử lại sau.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FC]" edges={["top", "left", "right", "bottom"]}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[#111827] text-lg font-bold">Tài khoản ngân hàng</Text>
          <Text className="text-[#6B7280] text-xs mt-0.5">Quản lý tài khoản nhận thu nhập</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" size="large" />
          <Text className="text-[#6B7280] mt-3">Đang tải tài khoản...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Feather name="alert-circle" size={30} color="#DC2626" />
          </View>
          <Text className="text-[#111827] font-bold text-base mt-4">Không tải được dữ liệu</Text>
          <Text className="text-[#6B7280] text-center mt-2">Kiểm tra kết nối và thử lại.</Text>
          <TouchableOpacity className="bg-[#2563EB] rounded-xl px-5 py-3 mt-5" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={methods}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 120,
            flexGrow: methods.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor="#2563EB"
            />
          }
          ListHeaderComponent={
            methods.length ? (
              <Text className="text-[#6B7280] font-semibold text-xs uppercase tracking-wide mb-3 ml-1">
                Tài khoản đã lưu
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <PaymentMethodCard
              method={item}
              disabled={isMutating}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="w-20 h-20 rounded-full bg-[#EEF2FF] items-center justify-center">
                <Feather name="credit-card" size={34} color="#2563EB" />
              </View>
              <Text className="text-[#111827] font-bold text-lg mt-5">Chưa có tài khoản nào</Text>
              <Text className="text-[#6B7280] text-center mt-2 leading-5">
                Thêm tài khoản ngân hàng để chuẩn bị nhận thu nhập từ CleanWise.
              </Text>
            </View>
          }
        />
      )}

      {!isError && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-7 bg-white border-t border-[#F3F4F6]">
          <TouchableOpacity
            className="flex-row bg-[#2563EB] rounded-2xl py-4 items-center justify-center"
            onPress={() => router.push("/payment-methods/add")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Thêm phương thức</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
