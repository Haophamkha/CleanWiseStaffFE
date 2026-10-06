import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FadeInView } from "@/components/ui/FadeInView";
import { PressableScale } from "@/components/ui/PressableScale";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, ON_DARK, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { ComplaintAction } from "@/features/complaint/components/ComplaintAction";
import { CancelReasonChips } from "@/features/job/components/CancelReasonChips";
import type { JobActionsState } from "@/features/job/hooks/useJobDetail";
import type {
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { getCheckInAvailability } from "@/features/schedule/utils/scheduleStatus";
import { Feather } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

type FeatherName = ComponentProps<typeof Feather>["name"];

type JobActionsProps = {
  isMine: boolean;
  isPackage: boolean;
  item: WorkerSchedule;
  mineItem?: WorkerMySchedule;
  actions: JobActionsState;
};

/** Nút hành động lớn: icon tròn bên trái, tiêu đề + mô tả, mũi tên bên phải. */
function HeroAction({
  title,
  subtitle,
  icon,
  tone,
  loading,
  loadingLabel,
  disabled,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: FeatherName;
  tone: "primary" | "dark";
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const inactive = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      containerStyle={{ marginBottom: 12 }}
      className={`flex-row items-center px-4 py-3.5 ${
        tone === "primary" ? "bg-primary" : "bg-ink"
      }`}
      style={[
        {
          borderRadius: RADIUS.card,
          minHeight: 72,
          opacity: inactive ? 0.7 : 1,
        },
        tone === "primary" ? SHADOWS.float : SHADOWS.card,
      ]}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: ON_DARK.surface }}
      >
        {loading ? (
          <ActivityIndicator color={ON_DARK.text} />
        ) : (
          <Feather name={icon} size={22} color={ON_DARK.text} />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-white text-[14px]"
          style={TYPE.button}
          numberOfLines={1}
        >
          {(loading && loadingLabel ? loadingLabel : title).toUpperCase()}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: ON_DARK.textSoft }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <Feather name="arrow-right" size={20} color={ON_DARK.text} />
    </PressableScale>
  );
}

/** Thông báo trạng thái (chưa tới giờ / quá giờ). */
function NoticeCard({
  icon,
  title,
  message,
  tone,
}: {
  icon: FeatherName;
  title: string;
  message: string;
  tone: "warning" | "danger";
}) {
  const isWarning = tone === "warning";
  return (
    <FadeInView>
      <View
        className={`flex-row items-center rounded-2xl px-4 py-3.5 mb-3 ${
          isWarning ? "bg-warning-light" : "bg-danger-light"
        }`}
      >
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
          <Feather
            name={icon}
            size={18}
            color={isWarning ? COLORS.warningDark : COLORS.danger}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-bold text-sm ${
              isWarning ? "text-warning-dark" : "text-danger"
            }`}
          >
            {title}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${
              isWarning ? "text-warning-dark" : "text-danger"
            }`}
          >
            {message}
          </Text>
        </View>
      </View>
    </FadeInView>
  );
}

function CheckInBlock({
  item,
  actions,
}: {
  item: WorkerSchedule;
  actions: JobActionsState;
}) {
  const availability = getCheckInAvailability(item.scheduled_start);

  if (availability.canStart) {
    return (
      <FadeInView delay={60}>
        <HeroAction
          title="Bắt đầu công việc"
          subtitle={
            item.address_ward
              ? `Tại ${item.address_ward}`
              : "Chạm để bắt đầu buổi làm"
          }
          icon="play"
          tone="primary"
          loading={actions.isCheckingIn}
          loadingLabel="Đang xử lý..."
          onPress={actions.handleCheckIn}
        />
      </FadeInView>
    );
  }

  // Quá hạn check-in: BE đã chặn, worker không tự check-in được nữa.
  if (availability.reason === "too_late") {
    return (
      <NoticeCard
        icon="alert-triangle"
        title="Đã quá giờ check-in"
        message="Vui lòng liên hệ CleanWise để được hỗ trợ."
        tone="danger"
      />
    );
  }

  return (
    <NoticeCard
      icon="clock"
      title="Chưa đến giờ bắt đầu"
      message={`Có thể bắt đầu từ ${availability.availableAtLabel}`}
      tone="warning"
    />
  );
}

function CheckOutBlock({ actions }: { actions: JobActionsState }) {
  const loading = actions.isCheckingOut;
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");

  const open = () => {
    if (loading) return;
    setNote("");
    setVisible(true);
  };
  const close = () => {
    if (loading) return;
    setVisible(false);
    setNote("");
  };
  const confirm = () => {
    if (loading) return;
    const trimmed = note.trim();
    setVisible(false);
    actions.handleCheckOut(trimmed);
  };

  return (
    <>
      <FadeInView delay={60}>
        <HeroAction
          title="Hoàn thành công việc"
          subtitle="Xác nhận đã làm xong buổi này"
          icon="check-circle"
          tone="dark"
          loading={loading}
          loadingLabel="Đang xử lý..."
          onPress={open}
        />
      </FadeInView>

      <ConfirmModal
        visible={visible}
        tone="dark"
        icon="check-circle"
        title="Hoàn thành buổi làm"
        message="Xác nhận bạn đã hoàn thành công việc"
        confirmLabel="Hoàn thành"
        cancelLabel="Để sau"
        loading={loading}
        onConfirm={confirm}
        onCancel={close}
      >
        <Text className="text-ink text-sm font-semibold mb-2">
          Ghi chú hoàn thành
          <Text className="text-ink-muted font-normal"> (không bắt buộc)</Text>
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ví dụ: Đã vệ sinh đầy đủ các khu vực theo yêu cầu..."
          placeholderTextColor={COLORS.inkMuted}
          multiline
          maxLength={1000}
          editable={!loading}
          className="border border-line bg-canvas rounded-2xl px-3.5 py-3 text-sm text-ink"
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
        <Text className="text-ink-muted text-xs text-right mt-1.5">
          {note.length}/1000
        </Text>
      </ConfirmModal>
    </>
  );
}

/** Liên hệ khách: thẻ trắng có icon tròn. */
function ContactAction({ actions }: { actions: JobActionsState }) {
  const loading = actions.openingChat;
  return (
    <FadeInView delay={120}>
      <PressableScale
        onPress={actions.handleOpenChat}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Liên hệ khách hàng"
        containerStyle={{ marginBottom: 12 }}
        className="flex-row items-center bg-surface border border-line px-4 py-3"
        style={[
          {
            borderRadius: RADIUS.card,
            minHeight: 64,
            opacity: loading ? 0.7 : 1,
          },
          SHADOWS.card,
        ]}
      >
        <View className="w-11 h-11 rounded-full bg-accent-light items-center justify-center mr-3">
          {loading ? (
            <ActivityIndicator color={COLORS.accentDark} />
          ) : (
            <Feather
              name="message-circle"
              size={20}
              color={COLORS.accentDark}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-ink text-sm font-extrabold">
            {loading ? "Đang mở trò chuyện..." : "Liên hệ khách hàng"}
          </Text>
          <Text className="text-ink-muted text-xs mt-0.5">
            Nhắn tin trao đổi trực tiếp với khách
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={COLORS.ink} />
      </PressableScale>
    </FadeInView>
  );
}

function CancelBlock({
  mineItem,
  actions,
}: {
  mineItem: WorkerMySchedule;
  actions: JobActionsState;
}) {
  if (!mineItem.can_cancel) {
    return (
      <FadeInView delay={180}>
        <View className="flex-row items-start bg-warning-light rounded-2xl p-4">
          <Feather
            name="lock"
            size={16}
            color={COLORS.warningDark}
            style={{ marginTop: 1 }}
          />
          <View className="flex-1 ml-3">
            <Text className="text-warning-dark text-sm font-bold mb-1">
              Không thể tự hủy
            </Text>
            <Text className="text-warning-dark text-xs leading-4">
              Chỉ còn dưới 6 tiếng trước giờ làm. Vui lòng liên hệ quản trị viên
              nếu cần hỗ trợ.
            </Text>
          </View>
        </View>
      </FadeInView>
    );
  }

  if (!actions.showCancelForm) {
    return (
      <FadeInView delay={180}>
        <PressableScale
          onPress={() => actions.setShowCancelForm(true)}
          accessibilityRole="button"
          className="flex-row border border-danger rounded-full items-center justify-center"
          style={{ height: 48 }}
        >
          <Feather name="x-circle" size={16} color={COLORS.danger} />
          <Text className="text-danger text-xs ml-2" style={TYPE.button}>
            HỦY NHẬN VIỆC
          </Text>
        </PressableScale>
      </FadeInView>
    );
  }

  const reasonEmpty = actions.reason.trim().length === 0;

  return (
    <FadeInView>
      <View
        className="bg-surface border border-line p-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-danger-light items-center justify-center mr-2.5">
            <Feather name="x-circle" size={16} color={COLORS.danger} />
          </View>
          <Text className="text-ink font-extrabold text-base flex-1">
            Lý do hủy
          </Text>
        </View>

        <CancelReasonChips
          value={actions.reason}
          onSelect={actions.setReason}
        />

        <TextInput
          value={actions.reason}
          onChangeText={actions.setReason}
          placeholder="Hoặc nhập lý do khác..."
          placeholderTextColor={COLORS.inkMuted}
          multiline
          className="border border-line bg-canvas rounded-2xl p-3 text-sm text-ink mb-3"
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        <PressableScale
          onPress={actions.requestCancel}
          disabled={actions.isCancelling || reasonEmpty}
          accessibilityRole="button"
          containerStyle={{ marginBottom: 6 }}
          className="bg-danger rounded-full items-center justify-center"
          style={{
            height: 48,
            opacity: actions.isCancelling || reasonEmpty ? 0.45 : 1,
          }}
        >
          <Text className="text-white text-xs" style={TYPE.button}>
            XÁC NHẬN HỦY
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => actions.setShowCancelForm(false)}
          accessibilityRole="button"
          className="items-center justify-center"
          style={{ minHeight: 44 }}
        >
          <Text className="text-ink-soft text-sm font-semibold">Đóng</Text>
        </PressableScale>
      </View>
    </FadeInView>
  );
}

export function JobActions({
  isMine,
  isPackage,
  item,
  mineItem,
  actions,
}: JobActionsProps) {
  if (isPackage) return null;

  if (!isMine) {
    return item.claim_state === "OPEN" ? (
      <PrimaryButton
        label="Nhận việc"
        loading={actions.isClaiming}
        loadingLabel="Đang xử lý..."
        onPress={actions.handleClaim}
        disabled={actions.isClaiming}
      />
    ) : (
      <View className="flex-row items-center justify-center bg-accent-light rounded-2xl py-4 px-4">
        <Feather
          name={item.claim_state === "MINE" ? "check-circle" : "users"}
          size={16}
          color={COLORS.inkSoft}
        />
        <Text className="text-ink-soft font-semibold text-sm ml-2">
          {item.claim_state === "MINE"
            ? "Bạn đã nhận buổi này."
            : "Đã có nhân viên khác nhận buổi này."}
        </Text>
      </View>
    );
  }

  return (
    <>
      {mineItem?.status === "PENDING" && mineItem.assignment_id ? (
        <CheckInBlock item={item} actions={actions} />
      ) : null}

      {mineItem?.status === "IN_PROGRESS" ? (
        <CheckOutBlock actions={actions} />
      ) : null}

      {mineItem?.assignment_id ? <ContactAction actions={actions} /> : null}

      {mineItem?.status === "MISSED" ? (
        <ComplaintAction
          bookingId={item.booking_id}
          scheduleId={item.id}
          scheduleStatus="MISSED"
        />
      ) : mineItem?.assignment_id && mineItem.status !== "CANCELLED" ? (
        <ComplaintAction
          bookingId={item.booking_id}
          scheduleId={item.id}
          scheduleStatus={mineItem.status}
        />
      ) : null}

      {mineItem?.status === "PENDING" ? (
        <CancelBlock mineItem={mineItem} actions={actions} />
      ) : null}
    </>
  );
}
