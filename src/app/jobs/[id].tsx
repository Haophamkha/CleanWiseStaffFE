import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ServiceDetailReadOnly } from "@/components/job/ServiceDetailReadOnly";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useLazyGetAssignmentConversationQuery } from "@/services/chatApi";
import {
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useClaimScheduleMutation,
  useGetAvailableSchedulesQuery,
  useGetMySchedulesQuery,
  useUploadScheduleImageMutation,
} from "@/services/jobsApi";
import type { PaymentStatus, ScheduleImageType } from "@/types/Schedule";
import { pickImage } from "@/utils/imagePicker";

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    color: "#B45309",
    bg: "#FEF3C7",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "#15803D",
    bg: "#DCFCE7",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
  MISSED: {
    label: "Đã bỏ lỡ",
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

function getErrorMessage(err: any): string {
  const data = err?.data ?? err?.error?.data;
  if (!data) return "Có lỗi xảy ra, vui lòng thử lại.";
  if (typeof data === "string") return data;
  const firstKey = Object.keys(data)[0];
  const val = data[firstKey];
  return Array.isArray(val) ? String(val[0]) : String(val ?? "Có lỗi xảy ra.");
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
        <Feather name={icon} size={14} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-[#9CA3AF] text-xs mb-0.5">{label}</Text>
        <Text className="text-[#111827] text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  UNPAID: {
    label: "Chưa thanh toán",
    bg: "#FEF3C7",
    text: "#92400E",
  },
  PAID: {
    label: "Đã thanh toán",
    bg: "#D1FAE5",
    text: "#047857",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    bg: "#E5E7EB",
    text: "#374151",
  },
};

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const info = PAYMENT_STATUS_MAP[status];
  if (!info) return null;
  return (
    <View
      className="self-start px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: info.bg }}
    >
      <Text className="text-xs font-bold" style={{ color: info.text }}>
        {info.label}
      </Text>
    </View>
  );
}

function CustomerHeader({
  avatar,
  name,
}: {
  avatar: string | null;
  name: string;
}) {
  return (
    <View className="flex-row items-center">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
      ) : (
        <View className="w-11 h-11 rounded-full bg-[#EEF2FF] items-center justify-center">
          <Feather name="user" size={18} color="#2563EB" />
        </View>
      )}
      <View className="ml-3">
        <Text className="text-[#9CA3AF] text-xs mb-0.5">Khách đặt đơn</Text>
        <Text className="text-[#111827] text-sm font-bold">{name}</Text>
      </View>
    </View>
  );
}

export default function JobDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const scheduleId = Number(id);
  const isMine = source === "mine";

  const [reason, setReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const availableQuery = useGetAvailableSchedulesQuery(undefined, {
    skip: isMine,
  });
  const mineQuery = useGetMySchedulesQuery(undefined, { skip: !isMine });

  const item = useMemo(() => {
    const list = isMine ? mineQuery.data : availableQuery.data;
    return list?.find((s) => s.id === scheduleId);
  }, [isMine, mineQuery.data, availableQuery.data, scheduleId]);

  const [claimSchedule, { isLoading: isClaiming }] = useClaimScheduleMutation();
  const [cancelAssignment, { isLoading: isCancelling }] =
    useCancelAssignmentMutation();
  const [getChat, { isFetching: openingChat }] =
    useLazyGetAssignmentConversationQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadScheduleImageMutation();

  const isLoading = isMine ? mineQuery.isLoading : availableQuery.isLoading;

  const handleClaim = async () => {
    try {
      await claimSchedule(scheduleId).unwrap();
      Alert.alert("Thành công", "Bạn đã nhận buổi làm này.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Không thể nhận việc", getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!item || !("assignment_id" in item) || !item.assignment_id) return;
    if (reason.trim().length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do hủy.");
      return;
    }
    try {
      await cancelAssignment({
        assignmentId: item.assignment_id,
        reason: reason.trim(),
      }).unwrap();
      Alert.alert("Đã hủy", "Bạn đã hủy nhận buổi làm này.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Không thể hủy", getErrorMessage(err));
    }
  };

  const handleOpenDirections = () => {
    if (!item?.address_latitude || !item?.address_longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${item.address_latitude},${item.address_longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Không thể mở bản đồ", "Vui lòng thử lại sau."),
    );
  };

  const handleOpenChat = async () => {
    if (!item || !("assignment_id" in item) || !item.assignment_id) return;
    try {
      const result = await getChat(item.assignment_id).unwrap();
      router.push({
        pathname: "/messages/[id]",
        params: {
          id: String(result.conversation.id),
          assignmentId: String(item.assignment_id),
        },
      });
    } catch {
      Alert.alert(
        "Không mở được trò chuyện",
        "Vui lòng kiểm tra lịch phân công và thử lại.",
      );
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn(scheduleId).unwrap();
    } catch (err) {
      Alert.alert("Không thể bắt đầu", getErrorMessage(err));
    }
  };

  const handleCheckOut = () => {
    Alert.alert(
      "Xác nhận hoàn thành",
      "Bạn chắc chắn đã hoàn thành công việc này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              await checkOut(scheduleId).unwrap();
              Alert.alert("Hoàn thành", "Bạn đã hoàn thành buổi làm việc.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert("Không thể hoàn thành", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const pickAndUpload = async (imageType: ScheduleImageType) => {
    const file = await pickImage();
    if (!file) return;
    try {
      await uploadImage({ scheduleId, image: file, imageType }).unwrap();
    } catch (err) {
      Alert.alert("Tải ảnh thất bại", getErrorMessage(err));
    }
  };

  const handleAddImage = () => {
    Alert.alert("Chọn loại ảnh", "Ảnh này chụp vào thời điểm nào?", [
      { text: "Trước khi làm", onPress: () => pickAndUpload("BEFORE") },
      { text: "Sau khi làm", onPress: () => pickAndUpload("AFTER") },
      { text: "Vấn đề phát sinh", onPress: () => pickAndUpload("ISSUE") },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC] px-6">
        <Text className="text-[#111827] font-semibold text-base mb-1">
          Không tìm thấy buổi làm
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-[#2563EB] font-medium">Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const mineItem = isMine ? (item as any) : null;
  const hasCoordinates = !!item.address_latitude && !!item.address_longitude;
  const statusBadge = STATUS_LABEL[item.status] ?? STATUS_LABEL.PENDING;
  const showImagesSection =
    isMine &&
    mineItem &&
    !["PENDING", "CANCELLED", "MISSED"].includes(mineItem.status);

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center px-5 pb-4 bg-white border-b border-[#F3F4F6]"
      >
        <Pressable onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[#111827] text-base font-bold">Chi tiết đơn</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 40 + insets.bottom,
        }}
      >
        <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[#9CA3AF] text-xs">
              {item.booking_code} · Buổi {item.sequence_no}/
              {item.total_sessions}
            </Text>
            <View
              style={{ backgroundColor: statusBadge.bg }}
              className="px-2 py-1 rounded-full"
            >
              <Text
                style={{ color: statusBadge.color }}
                className="text-xs font-medium"
              >
                {statusBadge.label}
              </Text>
            </View>
          </View>

          <Text className="text-[#111827] text-lg font-bold mb-3">
            {item.service_name}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-[#9CA3AF] text-xs mb-0.5">Thu nhập</Text>
              <Text className="text-[#2563EB] font-bold text-xl">
                {formatCurrency(item.price) ?? "—"}
              </Text>
            </View>
            <PaymentBadge status={item.payment_status} />
          </View>

          <InfoRow
            icon="calendar"
            label="Bắt đầu"
            value={formatDateTime(item.scheduled_start)}
          />
          <InfoRow
            icon="clock"
            label="Kết thúc"
            value={formatDateTime(item.scheduled_end)}
          />
          <InfoRow
            icon="map-pin"
            label="Khu vực"
            value={`${item.address_ward ? item.address_ward + ", " : ""}${item.address_city}`}
          />

          {mineItem && (
            <>
              <InfoRow
                icon="home"
                label="Địa chỉ chi tiết"
                value={mineItem.address_line}
              />
              <InfoRow
                icon="user"
                label="Người nhận"
                value={mineItem.receiver_name}
              />
              <InfoRow
                icon="phone"
                label="Số điện thoại"
                value={mineItem.receiver_phone}
              />
            </>
          )}

          {hasCoordinates && (
            <Pressable
              onPress={handleOpenDirections}
              className="flex-row items-center justify-center bg-[#EEF2FF] rounded-xl py-3 mt-1"
            >
              <Feather name="navigation" size={15} color="#2563EB" />
              <Text className="text-[#2563EB] font-semibold text-sm ml-2">
                Chỉ đường
              </Text>
            </Pressable>
          )}

          {item.booking_note ? (
            <InfoRow
              icon="file-text"
              label="Ghi chú đơn"
              value={item.booking_note}
            />
          ) : null}
          {mineItem?.note ? (
            <InfoRow
              icon="edit-3"
              label="Ghi chú buổi làm"
              value={mineItem.note}
            />
          ) : null}
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
          <CustomerHeader
            avatar={item.customer_avatar}
            name={item.customer_name}
          />
        </View>

        <ServiceDetailReadOnly
          fields={item.form_schema?.fields}
          values={item.service_data}
        />

        {isMine && mineItem?.cancel_deadline && (
          <View className="bg-white rounded-2xl mb-4 border border-[#F3F4F6] overflow-hidden">
            <Pressable
              onPress={() => setShowMore((v) => !v)}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-[#111827] font-semibold text-sm">
                Thông tin thêm
              </Text>
              <Feather
                name={showMore ? "chevron-up" : "chevron-down"}
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
            {showMore && (
              <View className="px-4 pb-4">
                <InfoRow
                  icon="alert-circle"
                  label="Hạn tự hủy"
                  value={formatDateTime(mineItem.cancel_deadline)}
                />
              </View>
            )}
          </View>
        )}

        {showImagesSection && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#111827] text-base font-bold">
                Ảnh trước/sau khi làm
              </Text>
              {mineItem.status === "IN_PROGRESS" && (
                <Pressable
                  onPress={handleAddImage}
                  disabled={isUploading}
                  className="flex-row items-center"
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Feather name="camera" size={15} color="#2563EB" />
                      <Text className="text-[#2563EB] text-sm font-medium ml-1">
                        Thêm ảnh
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>

            {mineItem.images?.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mineItem.images.map((img: any) => (
                  <Image
                    key={img.id}
                    source={{ uri: img.image }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      marginRight: 10,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            ) : (
              <Text className="text-[#9CA3AF] text-sm">Chưa có ảnh nào.</Text>
            )}
          </View>
        )}

        {!isMine && (
          <Pressable
            onPress={handleClaim}
            disabled={isClaiming}
            className="bg-[#2563EB] rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              {isClaiming ? "Đang xử lý..." : "Nhận việc"}
            </Text>
          </Pressable>
        )}

        {isMine && mineItem?.status === "PENDING" && mineItem.assignment_id && (
          <PrimaryButton
            label="Bắt đầu công việc"
            loading={isCheckingIn}
            loadingLabel="Đang xử lý..."
            icon="play"
            onPress={handleCheckIn}
            className="bg-[#2563EB] rounded-xl py-4 items-center mb-3"
          />
        )}

        {isMine && mineItem?.status === "IN_PROGRESS" && (
          <PrimaryButton
            label="Hoàn thành công việc"
            loading={isCheckingOut}
            loadingLabel="Đang xử lý..."
            icon="check-circle"
            onPress={handleCheckOut}
            className="bg-[#2563EB] rounded-xl py-4 items-center mb-3"
          />
        )}

        {isMine && mineItem?.assignment_id && (
          <Pressable
            onPress={handleOpenChat}
            disabled={openingChat}
            className="bg-[#2563EB] rounded-xl py-4 items-center flex-row justify-center mb-3"
          >
            <Feather name="message-circle" size={19} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base ml-2">
              {openingChat ? "Đang mở..." : "Liên hệ khách hàng"}
            </Text>
          </Pressable>
        )}

        {isMine && mineItem && mineItem.status === "PENDING" && (
          <View>
            {mineItem.can_cancel ? (
              showCancelForm ? (
                <View className="bg-white rounded-2xl p-4 border border-[#F3F4F6]">
                  <Text className="text-[#111827] font-medium text-sm mb-2">
                    Lý do hủy
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Nhập lý do hủy nhận việc..."
                    multiline
                    className="border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#111827] mb-3"
                    style={{ minHeight: 80, textAlignVertical: "top" }}
                  />
                  <Pressable
                    onPress={handleCancel}
                    disabled={isCancelling}
                    className="bg-[#DC2626] rounded-xl py-3 items-center mb-2"
                  >
                    <Text className="text-white font-semibold text-sm">
                      {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCancelForm(false)}
                    className="items-center py-2"
                  >
                    <Text className="text-[#6B7280] text-sm">Đóng</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowCancelForm(true)}
                  className="border border-[#DC2626] rounded-xl py-4 items-center"
                >
                  <Text className="text-[#DC2626] font-semibold text-base">
                    Hủy nhận việc
                  </Text>
                </Pressable>
              )
            ) : (
              <View className="bg-[#FEF3C7] rounded-xl p-4">
                <Text className="text-[#92400E] text-sm font-medium mb-1">
                  Không thể tự hủy
                </Text>
                <Text className="text-[#92400E] text-xs">
                  Chỉ còn dưới 2 tiếng trước giờ làm. Vui lòng liên hệ quản trị
                  viên nếu cần hỗ trợ.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
