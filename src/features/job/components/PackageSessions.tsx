import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { CancelReasonChips } from "@/features/job/components/CancelReasonChips";
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
import { useEffect, useRef } from "react";
import {
  Animated,
  LayoutAnimation,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SelectDot({ checked }: { checked: boolean }) {
  const pop = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      damping: 10,
      stiffness: 220,
    }).start();
  }, [checked, pop]);

  const scale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View
      className={`w-7 h-7 rounded-full items-center justify-center border-2 ${
        checked ? "bg-ink border-ink" : "bg-surface border-line"
      }`}
    >
      <Animated.View style={{ opacity: pop, transform: [{ scale }] }}>
        <Feather name="check" size={15} color={COLORS.white} />
      </Animated.View>
    </View>
  );
}

/** Mũi tên xoay 180° khi mở rộng. */
function ExpandChevron({ expanded }: { expanded: boolean }) {
  const turn = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(turn, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [expanded, turn]);

  const rotate = turn.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Feather name="chevron-down" size={20} color={COLORS.ink} />
    </Animated.View>
  );
}

type SessionRowProps = {
  session: WorkerSchedule;
  total: number;
  showCheckbox: boolean;
  actions: JobActionsState;
  index: number;
};

function SessionRow({
  session,
  total,
  showCheckbox,
  actions,
  index,
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
  const reasonEmpty = actions.sessionCancelReason.trim().length === 0;

  const onPress = () => {
    if (interaction === "expand-cancel") {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          220,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
    }
    actions.handleSessionPress(session);
  };

  return (
    <FadeInView delay={Math.min(index, 6) * 50}>
      <View
        className={`mb-3 border overflow-hidden bg-surface ${
          highlighted ? "border-ink" : "border-line"
        }`}
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          className="flex-row items-center p-3"
          style={{ minHeight: 76 }}
        >
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 ${
              highlighted ? "bg-ink" : "bg-accent-light"
            }`}
          >
            <Text
              className={`text-lg font-extrabold ${
                highlighted ? "text-white" : "text-ink"
              }`}
            >
              {dayNum}
            </Text>
            <Text
              className={`text-[10px] font-semibold ${
                highlighted ? "text-white" : "text-ink-soft"
              }`}
              style={highlighted ? { opacity: 0.8 } : undefined}
            >
              {monthLabel}
            </Text>
          </View>

          <View className="flex-1 pr-2">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-ink text-sm font-extrabold capitalize">
                {weekday}
              </Text>
              {dayChip ? (
                <View className="bg-primary-light rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-primary text-[10px] font-bold">
                    {dayChip}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="flex-row items-center mt-1">
              <Feather name="clock" size={12} color={COLORS.inkMuted} />
              <Text className="text-ink-soft text-xs ml-1.5">
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

          <View className="w-8 items-center">
            {interaction === "navigate" ? (
              <Feather name="chevron-right" size={20} color={COLORS.ink} />
            ) : interaction === "expand-cancel" ? (
              <ExpandChevron expanded={isExpanded} />
            ) : showCheckbox && isOpen ? (
              <SelectDot checked={checked} />
            ) : null}
          </View>
        </Pressable>

        {interaction === "expand-cancel" && isExpanded ? (
          <View className="px-4 pb-4 pt-3 bg-canvas border-t border-line">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-danger-light items-center justify-center mr-2.5">
                <Feather name="x-circle" size={15} color={COLORS.danger} />
              </View>
              <Text className="text-ink text-sm font-extrabold flex-1">
                Hủy nhận buổi này
              </Text>
            </View>

            <CancelReasonChips
              value={actions.sessionCancelReason}
              onSelect={actions.setSessionCancelReason}
            />

            <TextInput
              value={actions.sessionCancelReason}
              onChangeText={actions.setSessionCancelReason}
              placeholder="Hoặc nhập lý do khác..."
              placeholderTextColor={COLORS.inkMuted}
              multiline
              className="border border-line bg-surface rounded-2xl p-3 text-sm text-ink mb-3"
              style={{ minHeight: 64, textAlignVertical: "top" }}
            />

            <PressableScale
              onPress={() => actions.requestCancelSession(session)}
              disabled={actions.isCancelling || reasonEmpty}
              accessibilityRole="button"
              className="bg-danger rounded-full items-center justify-center"
              style={{
                height: 46,
                opacity: actions.isCancelling || reasonEmpty ? 0.45 : 1,
              }}
            >
              <Text className="text-white text-xs" style={TYPE.button}>
                HỦY NHẬN BUỔI NÀY
              </Text>
            </PressableScale>
          </View>
        ) : null}
      </View>
    </FadeInView>
  );
}

/** Thanh tiến độ chạy mượt khi số buổi chọn thay đổi. */
function SelectionBar({ ratio }: { ratio: number }) {
  const value = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: ratio,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [ratio, value]);

  const width = value.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="h-2 bg-accent-light rounded-full overflow-hidden">
      <Animated.View className="h-full bg-ink rounded-full" style={{ width }} />
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
  const selectedCount = actions.validSelected.length;

  return (
    <View
      className="bg-surface border border-line p-4 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-9 h-9 rounded-full bg-accent-light items-center justify-center mr-2.5">
            <Feather name="layers" size={16} color={COLORS.accentDark} />
          </View>
          <Text className="text-ink text-base font-extrabold">
            Các buổi trong gói
          </Text>
        </View>
        {hasOpen ? (
          <PressableScale
            onPress={actions.toggleAll}
            hitSlop={8}
            accessibilityRole="button"
            className="flex-row items-center bg-accent-light rounded-full px-3.5"
            style={{ minHeight: 40 }}
          >
            <Feather
              name={actions.allSelected ? "x" : "check-square"}
              size={13}
              color={COLORS.ink}
            />
            <Text className="text-ink text-xs font-bold ml-1.5">
              {actions.allSelected ? "Bỏ chọn" : "Chọn tất cả"}
            </Text>
          </PressableScale>
        ) : null}
      </View>
      <Text className="text-ink-muted text-xs mb-4 leading-4">
        {hasOpen
          ? "Chạm vào buổi bạn đã nhận để hủy (nếu còn sớm) hoặc bắt đầu làm (nếu tới giờ)."
          : "Tất cả các buổi trong gói đã có người nhận. Chạm vào buổi bạn đã nhận để xem chi tiết."}
      </Text>

      {hasOpen ? (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-ink-soft text-xs font-medium">
              Đã chọn {selectedCount}/{openSessions.length} buổi trống
            </Text>
            {actions.selectedIncome !== null && selectedCount > 0 ? (
              <Text className="text-ink text-xs font-extrabold">
                {formatCurrency(actions.selectedIncome)}
              </Text>
            ) : null}
          </View>
          <SelectionBar ratio={selectedCount / openSessions.length} />
        </View>
      ) : null}

      {sessions.map((s, i) => (
        <SessionRow
          key={s.id}
          session={s}
          total={totalSessions}
          showCheckbox={hasOpen}
          actions={actions}
          index={i}
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
    <FadeInView offset={28}>
      <View
        style={[
          {
            paddingBottom: 12 + insets.bottom,
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
          },
          SHADOWS.card,
        ]}
        className="flex-row items-center bg-surface border-t border-line px-5 pt-4"
      >
        <View className="flex-1 mr-3">
          <Text className="text-ink-muted text-xs">
            {count > 0 ? `Đã chọn ${count} buổi` : "Chưa chọn buổi nào"}
          </Text>
          <Text className="text-ink font-extrabold text-lg">
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
    </FadeInView>
  );
}

//
