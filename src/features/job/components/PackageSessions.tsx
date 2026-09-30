import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { JobActionsState } from "@/features/job/hooks/useJobDetail";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import { getSessionInteraction } from "@/features/schedule/utils/scheduleStatus";
import {
    formatCurrency,
    formatDuration,
    formatTime,
    relativeDayLabel,
} from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SessionRowProps = {
  session: WorkerSchedule;
  total: number;
  showCheckbox: boolean;
  actions: JobActionsState;
};

function SessionRow({
  session,
  total,
  showCheckbox,
  actions,
}: SessionRowProps) {
  const interaction = getSessionInteraction(session);
  const isExpanded = actions.expandedSessionId === session.id;
  const checked = actions.validSelected.includes(session.id);

  const start = new Date(session.scheduled_start);
  const dayNum = String(start.getDate()).padStart(2, "0");
  const monthLabel = `Th${start.getMonth() + 1}`;
  const weekday = start.toLocaleDateString("vi-VN", { weekday: "long" });
  const dayChip = relativeDayLabel(session.scheduled_start);

  const isMineSession = session.claim_state === "MINE";
  const isTaken = session.claim_state === "TAKEN";
  const isConflict = session.claim_state === "CONFLICT";
  const isOpen = session.claim_state === "OPEN" && session.status === "PENDING";
  const showStatus = session.status !== "PENDING";
  const readyToCheckIn =
    interaction === "navigate" && session.status === "PENDING";
  const highlighted = checked || isMineSession;

  return (
    <View
      className={`rounded-2xl mb-2.5 border overflow-hidden ${
        highlighted ? "border-ink bg-canvas" : "border-line bg-surface"
      }`}
    >
      <Pressable
        onPress={() => actions.handleSessionPress(session)}
        className="flex-row items-center"
      >
        <View
          className={`w-14 self-stretch items-center justify-center ${
            highlighted ? "bg-ink" : "bg-canvas"
          }`}
        >
          <Text
            className={`text-lg font-extrabold ${highlighted ? "text-white" : "text-ink"}`}
          >
            {dayNum}
          </Text>
          <Text
            className={`text-[10px] font-semibold mt-0.5 ${
              highlighted ? "text-white" : "text-ink-muted"
            }`}
          >
            {monthLabel}
          </Text>
        </View>

        <View className="flex-1 px-3.5 py-3">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-ink text-sm font-bold capitalize">
              {weekday}
            </Text>
            {dayChip ? (
              <View className="bg-accent-light rounded-full px-2 py-0.5 ml-2">
                <Text className="text-ink text-[10px] font-bold">
                  {dayChip}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={12} color={COLORS.inkMuted} />
            <Text className="text-ink-soft text-xs ml-1">
              {formatTime(session.scheduled_start)} -{" "}
              {formatTime(session.scheduled_end)} ·{" "}
              {formatDuration(session.scheduled_start, session.scheduled_end)}
            </Text>
          </View>

          <View className="flex-row items-center mt-1.5 flex-wrap">
            <Text className="text-ink-muted text-[11px] mr-2">
              Buổi {session.sequence_no}/{total}
            </Text>
            {showStatus ? (
              <StatusBadge status={session.status} />
            ) : readyToCheckIn ? (
              <View className="px-2 py-0.5 rounded-full bg-success-light">
                <Text className="text-success text-[10px] font-bold">
                  Sẵn sàng check-in
                </Text>
              </View>
            ) : isMineSession ? (
              <View className="px-2 py-0.5 rounded-full bg-accent-light">
                <Text className="text-ink text-[10px] font-bold">
                  Bạn đã nhận
                </Text>
              </View>
            ) : isTaken ? (
              <View className="px-2 py-0.5 rounded-full bg-accent-light">
                <Text className="text-ink-soft text-[10px] font-bold">
                  Đã có nhân viên nhận
                </Text>
              </View>
            ) : isConflict ? (
              <View className="px-2 py-0.5 rounded-full bg-danger-light">
                <Text className="text-danger text-[10px] font-bold">
                  Trùng lịch của bạn
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="pr-4">
          {interaction === "navigate" ? (
            <Feather name="chevron-right" size={18} color={COLORS.ink} />
          ) : interaction === "expand-cancel" ? (
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={COLORS.ink}
            />
          ) : showCheckbox && isOpen ? (
            <View
              className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                checked ? "bg-ink border-ink" : "bg-surface border-line"
              }`}
            >
              {checked ? (
                <Feather name="check" size={14} color={COLORS.white} />
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      {interaction === "expand-cancel" && isExpanded ? (
        <View className="px-4 pb-4 pt-1 border-t border-line">
          <Text className="text-ink text-xs font-semibold mb-2 mt-2">
            Lý do hủy buổi này
          </Text>
          <TextInput
            value={actions.sessionCancelReason}
            onChangeText={actions.setSessionCancelReason}
            placeholder="Nhập lý do hủy nhận buổi..."
            placeholderTextColor={COLORS.inkMuted}
            multiline
            className="border border-line bg-surface rounded-2xl p-3 text-sm text-ink mb-3"
            style={{ minHeight: 64, textAlignVertical: "top" }}
          />
          <Pressable
            onPress={() => actions.handleCancelSession(session)}
            disabled={actions.isCancelling}
            className="bg-danger rounded-full items-center justify-center"
            style={{ height: 44, opacity: actions.isCancelling ? 0.55 : 1 }}
          >
            <Text className="text-white text-xs" style={TYPE.button}>
              {actions.isCancelling ? "ĐANG HỦY..." : "HỦY NHẬN BUỔI NÀY"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

type PackageSessionsCardProps = {
  sessions: WorkerSchedule[];
  totalSessions: number;
  openSessions: WorkerSchedule[];
  actions: JobActionsState;
};

export function PackageSessionsCard({
  sessions,
  totalSessions,
  openSessions,
  actions,
}: PackageSessionsCardProps) {
  const hasOpen = openSessions.length > 0;

  return (
    <View
      className="bg-surface border border-line p-4 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-ink text-base font-extrabold">
          Các buổi trong gói
        </Text>
        {hasOpen ? (
          <Pressable
            onPress={actions.toggleAll}
            hitSlop={8}
            className="flex-row items-center bg-accent-light rounded-full px-3"
            style={{ minHeight: 36 }}
          >
            <Feather
              name={actions.allSelected ? "x" : "check-square"}
              size={12}
              color={COLORS.ink}
            />
            <Text className="text-ink text-xs font-semibold ml-1">
              {actions.allSelected ? "Bỏ chọn" : "Chọn tất cả"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="text-ink-muted text-xs mb-3">
        {hasOpen
          ? "Chạm vào buổi bạn đã nhận để hủy (nếu còn sớm) hoặc bắt đầu làm (nếu tới giờ)."
          : "Tất cả các buổi trong gói đã có người nhận. Chạm vào buổi bạn đã nhận để xem chi tiết."}
      </Text>

      {hasOpen ? (
        <View className="mb-3.5">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-ink-soft text-xs font-medium">
              Đã chọn {actions.validSelected.length}/{openSessions.length} buổi
              trống
            </Text>
            {actions.selectedIncome !== null &&
            actions.validSelected.length > 0 ? (
              <Text className="text-ink text-xs font-extrabold">
                {formatCurrency(actions.selectedIncome)}
              </Text>
            ) : null}
          </View>
          <View className="h-1.5 bg-accent-light rounded-full overflow-hidden">
            <View
              className="h-full bg-ink rounded-full"
              style={{
                width: `${(actions.validSelected.length / openSessions.length) * 100}%`,
              }}
            />
          </View>
        </View>
      ) : null}

      {sessions.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          total={totalSessions}
          showCheckbox={hasOpen}
          actions={actions}
        />
      ))}
    </View>
  );
}

type PackageClaimBarProps = { actions: JobActionsState };

/** Thanh nhận việc cố định đáy màn hình (đặt ngoài ScrollView). */
export function PackageClaimBar({ actions }: PackageClaimBarProps) {
  const insets = useSafeAreaInsets();
  const count = actions.validSelected.length;

  return (
    <View
      style={{ paddingBottom: 12 + insets.bottom }}
      className="flex-row items-center bg-surface border-t border-line px-5 pt-3"
    >
      <View className="flex-1 mr-3">
        <Text className="text-ink-muted text-xs">
          {count > 0 ? `Đã chọn ${count} buổi` : "Chưa chọn buổi nào"}
        </Text>
        <Text className="text-ink font-extrabold text-base">
          {count > 0 ? (formatCurrency(actions.selectedIncome) ?? "—") : "—"}
        </Text>
      </View>
      <PrimaryButton
        label={count > 0 ? `Nhận ${count} buổi` : "Nhận việc"}
        loading={actions.isClaimingPackage}
        loadingLabel="Đang xử lý..."
        onPress={actions.handleClaimSelected}
        disabled={count === 0 || actions.isClaimingPackage}
      />
    </View>
  );
}
