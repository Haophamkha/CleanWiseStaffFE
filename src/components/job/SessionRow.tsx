import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import type { WorkerSchedule } from "@/types/Schedule";
import { formatDuration, formatTime, relativeDayLabel } from "@/utils/format";
import { STATUS_LABEL } from "@/utils/scheduleStatus";

export function SessionRow({
  session,
  total,
  interaction,
  isExpanded,
  onPress,
  showCheckbox,
  checked,
  cancelReason,
  onChangeCancelReason,
  onConfirmCancel,
  isCancelling,
}: {
  session: WorkerSchedule;
  total: number;
  interaction: "expand-cancel" | "navigate" | "none";
  isExpanded: boolean;
  onPress: () => void;
  showCheckbox: boolean;
  checked: boolean;
  cancelReason: string;
  onChangeCancelReason: (v: string) => void;
  onConfirmCancel: () => void;
  isCancelling: boolean;
}) {
  const start = new Date(session.scheduled_start);
  const dayNum = String(start.getDate()).padStart(2, "0");
  const monthLabel = `Th${start.getMonth() + 1}`;
  const weekday = start.toLocaleDateString("vi-VN", { weekday: "long" });
  const dayChip = relativeDayLabel(session.scheduled_start);

  const isMineSession = session.claim_state === "MINE";
  const isTaken = session.claim_state === "TAKEN";
  const isConflict = session.claim_state === "CONFLICT";
  const isOpen = session.claim_state === "OPEN" && session.status === "PENDING";
  const nonPendingStatus =
    session.status !== "PENDING" ? STATUS_LABEL[session.status] : null;
  const readyToCheckIn =
    interaction === "navigate" && session.status === "PENDING";

  const highlighted = checked || isMineSession;

  return (
    <View
      className="rounded-2xl mb-2.5 border overflow-hidden"
      style={{
        borderColor: highlighted ? "#2563EB" : "#F3F4F6",
        backgroundColor: highlighted ? "#F5F8FF" : "#FFFFFF",
      }}
    >
      <Pressable onPress={onPress} className="flex-row items-center">
        <View
          className="w-14 self-stretch items-center justify-center"
          style={{ backgroundColor: highlighted ? "#2563EB" : "#F8F9FC" }}
        >
          <Text
            className="text-lg font-bold"
            style={{ color: highlighted ? "#FFFFFF" : "#111827" }}
          >
            {dayNum}
          </Text>
          <Text
            className="text-[10px] font-semibold mt-0.5"
            style={{ color: highlighted ? "#DBEAFE" : "#9CA3AF" }}
          >
            {monthLabel}
          </Text>
        </View>

        <View className="flex-1 px-3.5 py-3">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-[#111827] text-sm font-semibold capitalize">
              {weekday}
            </Text>
            {dayChip ? (
              <View className="bg-[#FEE2E2] rounded-full px-2 py-0.5 ml-2">
                <Text className="text-[#B91C1C] text-[10px] font-bold">
                  {dayChip}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={12} color="#9CA3AF" />
            <Text className="text-[#6B7280] text-xs ml-1">
              {formatTime(session.scheduled_start)} -{" "}
              {formatTime(session.scheduled_end)} ·{" "}
              {formatDuration(session.scheduled_start, session.scheduled_end)}
            </Text>
          </View>

          <View className="flex-row items-center mt-1.5 flex-wrap">
            <Text className="text-[#C4C9D4] text-[11px] mr-2">
              Buổi {session.sequence_no}/{total}
            </Text>
            {nonPendingStatus ? (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: nonPendingStatus.bg }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: nonPendingStatus.color }}
                >
                  {nonPendingStatus.label}
                </Text>
              </View>
            ) : readyToCheckIn ? (
              <View className="px-2 py-0.5 rounded-full bg-[#DCFCE7]">
                <Text className="text-[#15803D] text-[10px] font-bold">
                  Sẵn sàng check-in
                </Text>
              </View>
            ) : isMineSession ? (
              <View className="px-2 py-0.5 rounded-full bg-[#DBEAFE]">
                <Text className="text-[#1D4ED8] text-[10px] font-bold">
                  Bạn đã nhận
                </Text>
              </View>
            ) : isTaken ? (
              <View className="px-2 py-0.5 rounded-full bg-[#F3F4F6]">
                <Text className="text-[#6B7280] text-[10px] font-bold">
                  Đã có nhân viên nhận
                </Text>
              </View>
            ) : isConflict ? (
              <View className="px-2 py-0.5 rounded-full bg-[#FEE2E2]">
                <Text className="text-[#B91C1C] text-[10px] font-bold">
                  Trùng lịch của bạn
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="pr-4">
          {interaction === "navigate" ? (
            <Feather name="chevron-right" size={18} color="#2563EB" />
          ) : interaction === "expand-cancel" ? (
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#2563EB"
            />
          ) : showCheckbox && isOpen ? (
            <View
              className="w-6 h-6 rounded-full items-center justify-center border-2"
              style={{
                backgroundColor: checked ? "#2563EB" : "#FFFFFF",
                borderColor: checked ? "#2563EB" : "#D1D5DB",
              }}
            >
              {checked ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      {interaction === "expand-cancel" && isExpanded && (
        <View className="px-4 pb-4 pt-1 border-t border-[#EEF2FF]">
          <Text className="text-[#111827] text-xs font-medium mb-2 mt-2">
            Lý do hủy buổi này
          </Text>
          <TextInput
            value={cancelReason}
            onChangeText={onChangeCancelReason}
            placeholder="Nhập lý do hủy nhận buổi..."
            multiline
            className="border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#111827] mb-3"
            style={{ minHeight: 64, textAlignVertical: "top" }}
          />
          <Pressable
            onPress={onConfirmCancel}
            disabled={isCancelling}
            className="bg-[#DC2626] rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold text-sm">
              {isCancelling ? "Đang hủy..." : "Hủy nhận buổi này"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
