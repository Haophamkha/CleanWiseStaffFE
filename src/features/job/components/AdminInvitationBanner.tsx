import { useTranslation } from "react-i18next";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRespondInvitationMutation } from "@/features/job/api/jobsApi";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import { getErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/format";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type Invitation = NonNullable<WorkerSchedule["invitation"]>;
type BaseProps = {
  invitation: Invitation;
  bookingId: number;
  scheduleId: number;
};

function useRemaining(expiresAt: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return new Date(expiresAt).getTime() - now;
}

/** Nút phản hồi lời mời: Nhận việc ở trên, Từ chối ở dưới. */
export function InvitationActions({
  invitation,
  bookingId,
  scheduleId,
}: BaseProps) {
  const { t: tr } = useTranslation();

  const remaining = useRemaining(invitation.expires_at);
  const active = invitation.status === "PENDING" && remaining > 0;
  const [action, setAction] = useState<"accept" | "decline" | null>(null);
  const [respond, { isLoading }] = useRespondInvitationMutation();

  const submit = async () => {
    if (!action || !active) {
      setAction(null);
      return;
    }
    try {
      await respond({
        invitationId: invitation.id,
        action,
        idempotencyKey: Crypto.randomUUID(),
      }).unwrap();
      setAction(null);
      if (action === "accept") {
        router.replace({
          pathname: "/jobs/[id]",
          params: {
            id: String(scheduleId),
            bookingId: String(bookingId),
            source: "mine",
            view: "session",
          },
        });
      } else {
        Alert.alert(
          tr("Đã từ chối lời mời"),
          tr("Bạn đã từ chối lời mời nhận buổi làm này."),
        );
        router.back();
      }
    } catch (error) {
      setAction(null);
      Alert.alert(
        tr("Không thể phản hồi"),
        getErrorMessage(error) ||
          tr("Vui lòng tải lại để kiểm tra trạng thái lời mời."),
      );
    }
  };

  if (!active) return null;

  return (
    <>
      <TouchableOpacity
        disabled={isLoading}
        onPress={() => setAction("accept")}
        className="bg-primary-fill rounded-xl p-3.5 items-center"
      >
        <Text className="text-white font-semibold">{tr("Nhận việc")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isLoading}
        onPress={() => setAction("decline")}
        className="mt-3 border border-line bg-surface rounded-xl p-3 items-center"
      >
        <Text className="text-ink font-semibold">{tr("Từ chối")}</Text>
      </TouchableOpacity>
      <ConfirmModal
        visible={action !== null}
        tone={action === "decline" ? "danger" : "primary"}
        icon="user-check"
        title={
          action === "decline" ? tr("Từ chối lời mời?") : tr("Nhận buổi làm được mời?")
        }
        message={
          action === "decline"
            ? tr("Bạn sẽ không nhận buổi làm từ lời mời này.")
            : tr("Người xác nhận đầu tiên sẽ nhận buổi làm. Nếu nhận thành công, buổi làm sẽ được thêm vào lịch của bạn.")
        }
        confirmLabel={action === "decline" ? tr("Từ chối") : tr("Nhận việc")}
        cancelLabel={tr("Quay lại")}
        loading={isLoading}
        onConfirm={submit}
        onCancel={() => setAction(null)}
      />
    </>
  );
}

/** Thẻ thông tin lời mời. inlineActions=true thì nút nằm ngay trong thẻ (dùng cho đơn gói). */
export function AdminInvitationBanner({
  invitation,
  bookingId,
  scheduleId,
  sequenceNo,
  inlineActions = false,
}: BaseProps & { sequenceNo: number; inlineActions?: boolean }) {
  const { t: tr } = useTranslation();

  const remaining = useRemaining(invitation.expires_at);
  const active = invitation.status === "PENDING" && remaining > 0;
  const labels = {
    ACCEPTED: tr("Bạn đã nhận việc"),
    REJECTED: tr("Bạn đã từ chối lời mời"),
    CANCELLED: tr("Lời mời đã đóng"),
    EXPIRED: tr("Lời mời đã hết hạn"),
    PENDING: tr("Lời mời đã hết hạn"),
  };

  return (
    <View className="rounded-2xl border border-primary bg-surface p-4 mb-4">
      <Text className="font-bold text-ink text-base">
        {active ? tr("Lời mời nhận việc từ admin") : labels[invitation.status]}
      </Text>
      <Text className="text-ink-muted text-xs mt-1">{tr("Buổi #")}{" "}{sequenceNo}</Text>
      <Text className="text-ink-muted text-xs mt-1">
        {tr("Người gửi:")}{" "}{invitation.sender_name}
      </Text>
      <Text className="text-ink-muted text-xs mt-1">
        {tr("Hạn phản hồi:")}{" "}{formatDateTime(invitation.expires_at)}
      </Text>
      {active ? (
        <>
          <Text className="text-ink mt-3">
            {tr("Bạn có lời mời nhận việc mới. Vui lòng xem thông tin và xác nhận trước thời hạn.")}</Text>
          <Text className="text-primary text-sm mt-3">
            {tr("Còn")}{" "}{Math.ceil(remaining / 60000)} {tr("phút để phản hồi.")}</Text>
          {inlineActions ? (
            <View className="mt-3">
              <InvitationActions
                invitation={invitation}
                bookingId={bookingId}
                scheduleId={scheduleId}
              />
            </View>
          ) : null}
        </>
      ) : (
        <>
          {!!invitation.response_note && (
            <Text className="text-ink text-sm mt-3">
              {tr("Lý do:")}{" "}{invitation.response_note}
            </Text>
          )}

          <Text className="text-ink-muted text-sm mt-3">
            {tr("Lời mời này không còn chờ phản hồi. Nếu buổi làm vẫn đang mở, bạn có thể nhận từ danh sách chung.")}</Text>
        </>
      )}
      {invitation.status === "ACCEPTED" && (
        <TouchableOpacity
          className="mt-3 bg-primary-fill rounded-xl p-3 items-center"
          onPress={() =>
            router.replace({
              pathname: "/jobs/[id]",
              params: {
                id: String(scheduleId),
                bookingId: String(bookingId),
                source: "mine",
                view: "session",
              },
            })
          }
        >
          <Text className="text-white font-semibold">{tr("Xem việc của tôi")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
