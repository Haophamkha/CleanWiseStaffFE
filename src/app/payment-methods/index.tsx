import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, TYPE } from "@/constants/theme";
import PaymentMethodCard from "@/features/payment/components/PaymentMethodCard";
import { usePaymentMethods } from "@/features/payment/hooks/usePaymentMethods";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkerPaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const p = usePaymentMethods();
  const isEmpty = p.methods.length === 0;

  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader
        title="Tài khoản ngân hàng"
        subtitle="Quản lý tài khoản nhận thu nhập"
      />

      {p.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text className="text-ink-soft mt-3">Đang tải tài khoản...</Text>
        </View>
      ) : p.isError ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon="alert-circle"
            title="Không tải được dữ liệu"
            message="Kiểm tra kết nối và thử lại."
            actionLabel="Thử lại"
            onAction={() => p.refetch()}
          />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={p.methods}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
            flexGrow: isEmpty ? 1 : undefined,
            justifyContent: isEmpty ? "center" : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={p.isRefreshing}
              onRefresh={p.refetch}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            isEmpty ? null : (
              <Text
                className="text-ink-muted text-xs mb-2.5 ml-1"
                style={[TYPE.label, { letterSpacing: 1 }]}
              >
                TÀI KHOẢN ĐÃ LƯU
              </Text>
            )
          }
          renderItem={({ item }) => (
            <PaymentMethodCard
              method={item}
              disabled={p.isMutating}
              onSetDefault={p.handleSetDefault}
              onDelete={p.requestDelete}
              onVerify={p.handleVerify}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="credit-card"
              title="Chưa có tài khoản nào"
              message="Thêm tài khoản ngân hàng để chuẩn bị nhận thu nhập từ CleanWise."
            />
          }
        />
      )}

      {!p.isError && (
        <View
          className="px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <PrimaryButton
            label="Thêm phương thức"
            variant="primary"
            icon="plus"
            onPress={p.goAdd}
          />
        </View>
      )}

      <ConfirmModal
        visible={p.deleteVisible}
        title="Xóa tài khoản?"
        message={p.deleteMessage}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={p.confirmDelete}
        onCancel={p.cancelDelete}
      />
      <Modal visible={p.otpMethodId !== null || p.verifyMethodId !== null} transparent animationType="fade" onRequestClose={() => { p.setOtpMethodId(null); p.setVerifyMethodId(null); }}>
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-5">
            {p.verifyMethodId !== null ? <>
              <Text className="text-ink text-lg font-bold">Thông tin Sandbox</Text>
              <Text className="text-ink-soft mt-2 leading-5">Nhập CCCD/CMND và điện thoại theo kịch bản test TINGEE.</Text>
              <TextInput className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={p.identity} onChangeText={(value) => p.setIdentity(value.replace(/\D/g, "").slice(0, 14))} placeholder="CCCD/CMND test" />
              <TextInput className="border border-line rounded-2xl px-4 py-3 mt-3 text-ink" keyboardType="phone-pad" value={p.mobile} onChangeText={(value) => p.setMobile(value.replace(/\D/g, "").slice(0, 10))} placeholder="Điện thoại test" />
            </> : <>
              <Text className="text-ink text-lg font-bold">Nhập OTP Sandbox</Text>
              <Text className="text-ink-soft mt-2 leading-5">Nhập mã OTP giả lập của kịch bản TINGEE.</Text>
              <TextInput className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={p.otp} onChangeText={(value) => p.setOtp(value.replace(/\D/g, "").slice(0, 8))} placeholder="Mã OTP" maxLength={8} />
            </>}
            <View className="flex-row mt-5">
              <TouchableOpacity className="flex-1 py-3 items-center" onPress={() => { p.setOtpMethodId(null); p.setVerifyMethodId(null); }}><Text className="text-ink-soft font-semibold">Để sau</Text></TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 items-center bg-ink rounded-xl" onPress={p.verifyMethodId !== null ? p.handleStartVerification : p.handleConfirmOtp} disabled={p.isMutating || (p.verifyMethodId !== null ? p.identity.length < 9 || p.mobile.length !== 10 || !p.mobile.startsWith("0") : p.otp.length < 4)}><Text className="text-white font-bold">{p.isMutating ? "Đang kiểm tra..." : p.verifyMethodId !== null ? "Bắt đầu xác minh" : "Xác nhận OTP"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
