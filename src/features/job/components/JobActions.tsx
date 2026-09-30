import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { JobActionsState } from "@/features/job/hooks/useJobDetail";
import type {
    WorkerMySchedule,
    WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { getCheckInAvailability } from "@/features/schedule/utils/scheduleStatus";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type JobActionsProps = {
  isMine: boolean;
  isPackage: boolean;
  item: WorkerSchedule;
  mineItem?: WorkerMySchedule;
  actions: JobActionsState;
};

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
      <PrimaryButton
        label="Bắt đầu công việc"
        subtitle={
          item.address_ward
            ? `Tại ${item.address_ward}`
            : "Chạm để bắt đầu buổi làm"
        }
        loading={actions.isCheckingIn}
        loadingLabel="Đang xử lý..."
        icon="play"
        onPress={actions.handleCheckIn}
        disabled={actions.isCheckingIn}
        style={{ marginBottom: 12 }}
      />
    );
  }

  // Quá hạn check-in: BE đã chặn, worker không tự check-in được nữa.
  if (availability.reason === "too_late") {
    return (
      <View className="flex-row items-center bg-danger-light rounded-2xl px-4 py-3.5 mb-3">
        <View className="w-9 h-9 rounded-full bg-surface items-center justify-center mr-3">
          <Feather name="alert-triangle" size={16} color={COLORS.danger} />
        </View>
        <View className="flex-1">
          <Text className="text-danger font-semibold text-sm">
            Đã quá giờ check-in
          </Text>
          <Text className="text-danger text-xs mt-0.5">
            Vui lòng liên hệ CleanWise để được hỗ trợ.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center bg-warning-light rounded-2xl px-4 py-3.5 mb-3">
      <View className="w-9 h-9 rounded-full bg-surface items-center justify-center mr-3">
        <Feather name="clock" size={16} color={COLORS.warningDark} />
      </View>
      <View className="flex-1">
        <Text className="text-warning-dark font-semibold text-sm">
          Chưa đến giờ bắt đầu
        </Text>
        <Text className="text-warning-dark text-xs mt-0.5">
          Có thể bắt đầu từ {availability.availableAtLabel}
        </Text>
      </View>
    </View>
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
      <PrimaryButton
        label="Hoàn thành công việc"
        subtitle="Xác nhận đã làm xong buổi này"
        variant="dark"
        loading={loading}
        loadingLabel="Đang xử lý..."
        icon="check-circle"
        onPress={open}
        disabled={loading}
        style={{ marginBottom: 12 }}
      />

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          className="flex-1 items-center justify-center px-5"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: OVERLAY }]}
            onPress={close}
          />

          <View
            className="w-full bg-surface overflow-hidden"
            style={[{ borderRadius: RADIUS.card, maxWidth: 520 }, SHADOWS.card]}
          >
            <View className="flex-row items-center px-5 pt-5 pb-4">
              <View className="w-11 h-11 rounded-full bg-success-light items-center justify-center mr-3">
                <Feather name="check" size={22} color={COLORS.success} />
              </View>
              <View className="flex-1">
                <Text className="text-ink text-lg font-extrabold">
                  Hoàn thành buổi làm
                </Text>
                <Text className="text-ink-soft text-[13px] mt-1">
                  Xác nhận bạn đã hoàn thành công việc
                </Text>
              </View>
            </View>

            <View className="px-5 pb-5">
              <Text className="text-ink text-sm font-semibold mb-2">
                Ghi chú hoàn thành
                <Text className="text-ink-muted font-normal">
                  {" "}
                  (không bắt buộc)
                </Text>
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
                style={{ minHeight: 120, textAlignVertical: "top" }}
              />
              <Text className="text-ink-muted text-xs text-right mt-1.5">
                {note.length}/1000
              </Text>
            </View>

            <View className="flex-row px-5 pt-3.5 pb-5 border-t border-line">
              <PrimaryButton
                label="Hủy"
                variant="outline"
                onPress={close}
                disabled={loading}
                style={{ flex: 1, marginRight: 10 }}
              />
              <PrimaryButton
                label="Hoàn thành"
                variant="dark"
                loading={loading}
                loadingLabel="Đang xử lý..."
                onPress={confirm}
                disabled={loading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
      <View className="bg-warning-light rounded-2xl p-4">
        <Text className="text-warning-dark text-sm font-semibold mb-1">
          Không thể tự hủy
        </Text>
        <Text className="text-warning-dark text-xs">
          Chỉ còn dưới 6 tiếng trước giờ làm. Vui lòng liên hệ quản trị viên nếu
          cần hỗ trợ.
        </Text>
      </View>
    );
  }

  if (!actions.showCancelForm) {
    return (
      <Pressable
        onPress={() => actions.setShowCancelForm(true)}
        className="border border-danger rounded-full items-center justify-center"
        style={{ height: 48 }}
      >
        <Text className="text-danger text-xs" style={TYPE.button}>
          HỦY NHẬN VIỆC
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className="bg-surface border border-line p-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <Text className="text-ink font-semibold text-sm mb-2">Lý do hủy</Text>
      <TextInput
        value={actions.reason}
        onChangeText={actions.setReason}
        placeholder="Nhập lý do hủy nhận việc..."
        placeholderTextColor={COLORS.inkMuted}
        multiline
        className="border border-line bg-canvas rounded-2xl p-3 text-sm text-ink mb-3"
        style={{ minHeight: 80, textAlignVertical: "top" }}
      />
      <Pressable
        onPress={actions.handleCancel}
        disabled={actions.isCancelling}
        className="bg-danger rounded-full items-center justify-center mb-2"
        style={{ height: 46, opacity: actions.isCancelling ? 0.55 : 1 }}
      >
        <Text className="text-white text-xs" style={TYPE.button}>
          {actions.isCancelling ? "ĐANG HỦY..." : "XÁC NHẬN HỦY"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => actions.setShowCancelForm(false)}
        className="items-center justify-center"
        style={{ minHeight: 44 }}
      >
        <Text className="text-ink-soft text-sm">Đóng</Text>
      </Pressable>
    </View>
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
      <View className="bg-accent-light rounded-2xl py-4 items-center">
        <Text className="text-ink-soft font-semibold text-sm">
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

      {mineItem?.assignment_id ? (
        <PrimaryButton
          label="Liên hệ khách hàng"
          icon="message-circle"
          variant="outline"
          loading={actions.openingChat}
          loadingLabel="Đang mở..."
          onPress={actions.handleOpenChat}
          disabled={actions.openingChat}
          style={{ marginBottom: 12 }}
        />
      ) : null}

      {mineItem?.status === "PENDING" ? (
        <CancelBlock mineItem={mineItem} actions={actions} />
      ) : null}
    </>
  );
}
