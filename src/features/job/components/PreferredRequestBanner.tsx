import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { COLORS } from "@/constants/theme";
import { useDeclinePreferredMutation } from "@/features/job/api/jobsApi";
import { Feather } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

function useMinutesLeft(until: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  const remainingMs = new Date(until).getTime() - now;
  return remainingMs > 0 ? Math.max(1, Math.ceil(remainingMs / 60000)) : 0;
}

/** Thẻ thông tin ở đầu trang. */
export function PreferredRequestBanner({ until }: { until: string }) {
  const minutes = useMinutesLeft(until);
  if (!minutes) return null;
  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{
        backgroundColor: `${COLORS.primary}14`,
        borderWidth: 1,
        borderColor: `${COLORS.primary}40`,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Feather name="user-check" size={18} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[14px] text-ink">
            Khách chỉ định bạn
          </Text>
          <Text className="text-ink-muted text-xs mt-0.5">
            Còn {minutes} phút để nhận. Sau đó đơn mở cho tất cả nhân viên.
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Nút từ chối, đặt dưới nút Nhận việc. */
export function PreferredDeclineButton({
  bookingId,
  until,
  onDeclined,
}: {
  bookingId: number;
  until: string;
  onDeclined: () => void;
}) {
  const minutes = useMinutesLeft(until);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [decline, { isLoading }] = useDeclinePreferredMutation();
  if (!minutes) return null;

  const confirmDecline = async () => {
    try {
      await decline({
        bookingId,
        idempotencyKey: Crypto.randomUUID(),
      }).unwrap();
      setConfirmVisible(false);
      onDeclined();
    } catch (err: any) {
      setConfirmVisible(false);
      const message =
        err?.data?.errors?.booking ??
        err?.data?.message ??
        "Không thể từ chối, vui lòng thử lại.";
      Alert.alert(
        "Từ chối yêu cầu",
        Array.isArray(message) ? message.join("\n") : String(message),
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setConfirmVisible(true)}
        className="mt-3 items-center py-3 rounded-xl border border-line bg-surface"
      >
        <Text className="font-semibold text-[14px] text-ink">
          Từ chối yêu cầu
        </Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmVisible}
        tone="danger"
        icon="alert-triangle"
        title="Từ chối yêu cầu?"
        message="Đơn sẽ được mở cho tất cả nhân viên khác và khách sẽ được thông báo."
        confirmLabel="Từ chối"
        cancelLabel="Giữ lại"
        loading={isLoading}
        onConfirm={confirmDecline}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
}
