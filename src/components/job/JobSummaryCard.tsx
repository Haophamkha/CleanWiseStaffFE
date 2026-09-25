import { Feather } from "@expo/vector-icons";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { InfoRow } from "@/components/job/InfoRow";
import { PaymentBadge } from "@/components/job/PaymentBadge";
import type { WorkerMySchedule, WorkerSchedule } from "@/types/Schedule";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { STATUS_LABEL } from "@/utils/scheduleStatus";

type Props = {
  item: WorkerSchedule;
  mineItem: WorkerMySchedule | undefined;
  isPackage: boolean;
  totalSessions: number;
  openSessionsCount: number;
};

export function JobSummaryCard({
  item,
  mineItem,
  isPackage,
  totalSessions,
  openSessionsCount,
}: Props) {
  const hasCoordinates = !!item.address_latitude && !!item.address_longitude;
  const statusBadge = STATUS_LABEL[item.status] ?? STATUS_LABEL.PENDING;

  const handleOpenDirections = () => {
    if (!item.address_latitude || !item.address_longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${item.address_latitude},${item.address_longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Không thể mở bản đồ", "Vui lòng thử lại sau."),
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[#9CA3AF] text-xs">
          {isPackage
            ? `${item.booking_code} · Gói ${totalSessions} buổi`
            : `${item.booking_code} · Buổi ${item.sequence_no}/${item.total_sessions}`}
        </Text>
        {isPackage ? (
          <View className="bg-[#FEF3C7] rounded-full px-2.5 py-1">
            <Text className="text-[#92400E] text-xs font-semibold">
              Còn {openSessionsCount}/{totalSessions} buổi
            </Text>
          </View>
        ) : (
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
        )}
      </View>

      <Text className="text-[#111827] text-lg font-bold mb-3">
        {item.service_name}
      </Text>

      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-[#9CA3AF] text-xs mb-0.5">
            {isPackage ? "Thu nhập / buổi" : "Thu nhập"}
          </Text>
          <Text className="text-[#2563EB] font-bold text-xl">
            {formatCurrency(item.price) ?? "—"}
          </Text>
        </View>
        <PaymentBadge status={item.payment_status} />
      </View>

      {!isPackage ? (
        <>
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
        </>
      ) : null}
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
        <InfoRow icon="edit-3" label="Ghi chú buổi làm" value={mineItem.note} />
      ) : null}
    </View>
  );
}
