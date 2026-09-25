import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { SessionRow } from "@/components/job/SessionRow";
import type { WorkerSchedule } from "@/types/Schedule";
import { formatCurrency } from "@/utils/format";
import { getSessionInteraction } from "@/utils/scheduleStatus";

type Props = {
  bookingSchedules: WorkerSchedule[];
  totalSessions: number;
  openSessions: WorkerSchedule[];
  validSelected: number[];
  allSelected: boolean;
  selectedIncome: number | null;
  expandedSessionId: number | null;
  sessionCancelReason: string;
  isCancelling: boolean;
  onToggleAll: () => void;
  onSessionPress: (session: WorkerSchedule) => void;
  onChangeCancelReason: (v: string) => void;
  onConfirmCancel: (session: WorkerSchedule) => void;
};

export function PackageSessionsCard({
  bookingSchedules,
  totalSessions,
  openSessions,
  validSelected,
  allSelected,
  selectedIncome,
  expandedSessionId,
  sessionCancelReason,
  isCancelling,
  onToggleAll,
  onSessionPress,
  onChangeCancelReason,
  onConfirmCancel,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[#111827] text-base font-bold">
          Các buổi trong gói
        </Text>
        {openSessions.length > 0 ? (
          <Pressable
            onPress={onToggleAll}
            hitSlop={8}
            className="flex-row items-center bg-[#EEF2FF] rounded-full px-3 py-1.5"
          >
            <Feather
              name={allSelected ? "x" : "check-square"}
              size={12}
              color="#2563EB"
            />
            <Text className="text-[#2563EB] text-xs font-semibold ml-1">
              {allSelected ? "Bỏ chọn" : "Chọn tất cả"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="text-[#9CA3AF] text-xs mb-3">
        {openSessions.length > 0
          ? "Chạm vào buổi bạn đã nhận để hủy (nếu còn sớm) hoặc bắt đầu làm (nếu tới giờ)."
          : "Tất cả các buổi trong gói đã có người nhận. Chạm vào buổi bạn đã nhận để xem chi tiết."}
      </Text>

      {openSessions.length > 0 ? (
        <View className="mb-3.5">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[#6B7280] text-xs font-medium">
              Đã chọn {validSelected.length}/{openSessions.length} buổi trống
            </Text>
            {selectedIncome !== null && validSelected.length > 0 ? (
              <Text className="text-[#2563EB] text-xs font-bold">
                {formatCurrency(selectedIncome)}
              </Text>
            ) : null}
          </View>
          <View className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <View
              className="h-full bg-[#2563EB] rounded-full"
              style={{
                width: `${(validSelected.length / openSessions.length) * 100}%`,
              }}
            />
          </View>
        </View>
      ) : null}

      {bookingSchedules.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          total={totalSessions}
          interaction={getSessionInteraction(s)}
          isExpanded={expandedSessionId === s.id}
          onPress={() => onSessionPress(s)}
          showCheckbox={openSessions.length > 0}
          checked={validSelected.includes(s.id)}
          cancelReason={sessionCancelReason}
          onChangeCancelReason={onChangeCancelReason}
          onConfirmCancel={() => onConfirmCancel(s)}
          isCancelling={isCancelling}
        />
      ))}
    </View>
  );
}
