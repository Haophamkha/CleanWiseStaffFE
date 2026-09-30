import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

import { useLazyGetAssignmentConversationQuery } from "@/features/chat/api/chatApi";
import {
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useClaimBookingPackageMutation,
  useClaimScheduleMutation,
  useUploadScheduleImageMutation,
} from "@/features/job/api/jobsApi";
import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import type {
  ScheduleImageType,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { getSessionInteraction } from "@/features/schedule/utils/scheduleStatus";
import { verifyScheduleMutation } from "@/features/schedule/utils/verifyMutation";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { getErrorMessage, isNetworkError } from "@/utils/apiError";
import { formatDayLabel, formatTime } from "@/utils/format";

type Args = {
  scheduleId: number;
  isMine: boolean;
  item: WorkerSchedule | WorkerMySchedule | undefined;
  mineItem: WorkerMySchedule | undefined;
  bookingId: number | undefined;
  bookingSchedules: WorkerSchedule[];
  openSessions: WorkerSchedule[];
  refetchBookingSchedules: () => Promise<{
    data?: WorkerSchedule[];
  }>;
  refetchMineSchedules: () => Promise<unknown>;
};

export function useJobActions({
  scheduleId,
  isMine,
  item,
  mineItem,
  bookingId,
  bookingSchedules,
  openSessions,
  refetchBookingSchedules,
  refetchMineSchedules,
}: Args) {
  const [selected, setSelected] = useState<number[]>([]);

  const validSelected = useMemo(
    () => selected.filter((sid) => openSessions.some((s) => s.id === sid)),
    [selected, openSessions],
  );

  const allSelected =
    openSessions.length > 0 && validSelected.length === openSessions.length;

  const selectedIncome =
    item?.price !== null && item?.price !== undefined
      ? Number(item.price) * validSelected.length
      : null;

  const toggleSession = (sid: number) => {
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : openSessions.map((s) => s.id));
  };

  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(
    null,
  );

  const [sessionCancelReason, setSessionCancelReason] = useState("");

  const [reason, setReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    details?: string[];
  }>({
    visible: false,
    title: "",
  });

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({
      ...prev,
      visible: false,
    }));

    router.back();
  };

  const openSuccessModal = (payload: {
    title: string;
    message?: string;
    details?: string[];
  }) => {
    setSuccessModal({
      visible: true,
      ...payload,
    });
  };

  const [localImages, setLocalImages] = useState<
    Partial<Record<ScheduleImageType, PickedFile[]>>
  >({});

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const claimKey = useIdempotencyKey();
  const claimPackageKey = useIdempotencyKey();
  const cancelKey = useIdempotencyKey();
  const cancelSessionKey = useIdempotencyKey();

  const [claimSchedule, { isLoading: isClaiming }] = useClaimScheduleMutation();

  const [claimPackage, { isLoading: isClaimingPackage }] =
    useClaimBookingPackageMutation();

  const [cancelAssignment, { isLoading: isCancelling }] =
    useCancelAssignmentMutation();

  const [getChat, { isFetching: openingChat }] =
    useLazyGetAssignmentConversationQuery();

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();

  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const [uploadImage] = useUploadScheduleImageMutation();

  const handleSessionPress = (session: WorkerSchedule) => {
    const interaction = getSessionInteraction(session);

    if (interaction === "navigate") {
      router.push({
        pathname: "/jobs/[id]",
        params: {
          id: String(session.id),
          source: "mine",
          bookingId: String(session.booking_id),
          view: "session",
        },
      });

      return;
    }

    if (interaction === "expand-cancel") {
      setExpandedSessionId((prev) => (prev === session.id ? null : session.id));

      setSessionCancelReason("");
      return;
    }

    if (session.claim_state === "OPEN" && session.status === "PENDING") {
      toggleSession(session.id);
    }
  };

  const handleCancelSession = async (session: WorkerSchedule) => {
    if (!session.assignment_id) return;

    if (sessionCancelReason.trim().length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do hủy.");
      return;
    }

    try {
      await cancelAssignment({
        assignmentId: session.assignment_id,
        reason: sessionCancelReason.trim(),
        idempotencyKey: cancelSessionKey.getKey(),
      }).unwrap();

      cancelSessionKey.resetKey();

      setExpandedSessionId(null);
      setSessionCancelReason("");
    } catch (err) {
      await verifyScheduleMutation({
        err,
        scheduleId: session.id,
        refetch: refetchBookingSchedules,
        isNowSuccess: (s) => s.claim_state === "OPEN",
        successTitle: "Đã hủy",
        successMessage: "Bạn đã hủy nhận buổi làm này.",
        errorTitle: "Không thể hủy",
        onSuccess: () => {
          cancelSessionKey.resetKey();

          setExpandedSessionId(null);
          setSessionCancelReason("");
        },
      });
    }
  };

  const handleClaim = async () => {
    const successMessage = item
      ? `${item.service_name} · ${formatDayLabel(
          item.scheduled_start,
        )}, ${formatTime(
          item.scheduled_start,
        )} - ${formatTime(item.scheduled_end)}`
      : "Bạn đã nhận buổi làm này.";

    try {
      await claimSchedule({
        scheduleId,
        idempotencyKey: claimKey.getKey(),
      }).unwrap();

      claimKey.resetKey();

      openSuccessModal({
        title: "Nhận việc thành công",
        message: successMessage,
      });
    } catch (err) {
      await verifyScheduleMutation({
        err,
        scheduleId,
        refetch: refetchBookingSchedules,
        isNowSuccess: (s) => s.claim_state === "MINE",
        successTitle: "Nhận việc thành công",
        successMessage,
        errorTitle: "Không thể nhận việc",
        onSuccess: () => {
          claimKey.resetKey();

          openSuccessModal({
            title: "Nhận việc thành công",
            message: successMessage,
          });
        },
      });
    }
  };

  const handleClaimSelected = async () => {
    if (!bookingId || validSelected.length === 0) {
      return;
    }

    const attemptedIds = [...validSelected];

    try {
      const res: any = await claimPackage({
        bookingId,
        scheduleIds: attemptedIds,
        idempotencyKey: claimPackageKey.getKey(),
      }).unwrap();

      claimPackageKey.resetKey();

      const payload = res?.data ?? res;

      const claimed: {
        schedule_id: number;
      }[] = payload?.claimed ?? [];

      const skipped: {
        schedule_id: number;
        reason: string;
      }[] = payload?.skipped ?? [];

      const details = skipped.map((sk) => {
        const schedule = bookingSchedules.find((x) => x.id === sk.schedule_id);

        const label = schedule
          ? `${formatDayLabel(schedule.scheduled_start)}, ${formatTime(
              schedule.scheduled_start,
            )}`
          : `Buổi #${sk.schedule_id}`;

        return `${label}: ${sk.reason}`;
      });

      setSelected([]);

      openSuccessModal({
        title: "Nhận việc thành công",
        message:
          skipped.length > 0
            ? `Đã nhận ${claimed.length} buổi. ${skipped.length} buổi bị bỏ qua:`
            : `Bạn đã nhận ${claimed.length} buổi làm việc.`,
        details: skipped.length > 0 ? details : undefined,
      });
    } catch (err: any) {
      if (isNetworkError(err)) {
        try {
          const fresh = await refetchBookingSchedules();

          const freshData: WorkerSchedule[] = fresh?.data ?? bookingSchedules;

          const nowMine = attemptedIds.filter((sid) =>
            freshData.some((s) => s.id === sid && s.claim_state === "MINE"),
          );

          if (nowMine.length > 0) {
            claimPackageKey.resetKey();

            setSelected((prev) => prev.filter((sid) => !nowMine.includes(sid)));

            openSuccessModal({
              title: "Nhận việc thành công",
              message: `Bạn đã nhận ${nowMine.length} buổi làm việc. (Kết nối mạng bị gián đoạn lúc nhận thông báo, nhưng hệ thống đã ghi nhận buổi làm của bạn.)`,
            });

            return;
          }
        } catch {
          // Ignore verification failure.
        }
      }

      Alert.alert("Không thể nhận việc", getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!mineItem?.assignment_id) return;

    if (reason.trim().length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do hủy.");
      return;
    }

    try {
      await cancelAssignment({
        assignmentId: mineItem.assignment_id,
        reason: reason.trim(),
        idempotencyKey: cancelKey.getKey(),
      }).unwrap();

      cancelKey.resetKey();

      Alert.alert("Đã hủy", "Bạn đã hủy nhận buổi làm này.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      await verifyScheduleMutation({
        err,
        scheduleId,
        refetch: refetchBookingSchedules,
        isNowSuccess: (s) => s.claim_state === "OPEN",
        successTitle: "Đã hủy",
        successMessage: "Bạn đã hủy nhận buổi làm này.",
        errorTitle: "Không thể hủy",
        onSuccess: () => {
          cancelKey.resetKey();
          router.back();
        },
      });
    }
  };

  const handleOpenChat = async () => {
    if (!mineItem?.assignment_id) return;

    try {
      const result = await getChat(mineItem.assignment_id).unwrap();

      router.push({
        pathname: "/messages/[id]",
        params: {
          id: String(result.conversation.id),
          assignmentId: String(mineItem.assignment_id),
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

      await refetchBookingSchedules();
      await refetchMineSchedules();

      Alert.alert("Đã bắt đầu", "Bạn đã bắt đầu buổi làm việc này.");
    } catch (err) {
      await verifyScheduleMutation({
        err,
        scheduleId,
        refetch: refetchBookingSchedules,
        isNowSuccess: (s) => s.status === "IN_PROGRESS",
        successTitle: "Đã bắt đầu",
        successMessage: "Bạn đã bắt đầu buổi làm việc này.",
        errorTitle: "Không thể bắt đầu",
        onSuccess: () => refetchMineSchedules(),
      });
    }
  };

  const uploadAllStagedImages = async (): Promise<ScheduleImageType[]> => {
    const entries = Object.entries(localImages) as [
      ScheduleImageType,
      PickedFile[],
    ][];

    const pendingEntries = entries.filter(([, files]) => files.length > 0);

    if (pendingEntries.length === 0) {
      return [];
    }

    setIsUploadingImages(true);

    const failedTypes = new Set<ScheduleImageType>();

    const stillPending: Partial<Record<ScheduleImageType, PickedFile[]>> = {};

    for (const [imageType, files] of pendingEntries) {
      const results = await Promise.allSettled(
        files.map((file) =>
          uploadImage({
            scheduleId,
            image: file,
            imageType,
          }).unwrap(),
        ),
      );

      const failedFiles = files.filter(
        (_, idx) => results[idx].status === "rejected",
      );

      if (failedFiles.length > 0) {
        failedTypes.add(imageType);
        stillPending[imageType] = failedFiles;
      }
    }

    setLocalImages(stillPending);
    setIsUploadingImages(false);

    return Array.from(failedTypes);
  };

  const IMAGE_TYPE_LABEL: Record<ScheduleImageType, string> = {
    BEFORE: "Trước khi làm",
    AFTER: "Sau khi làm",
    ISSUE: "Vấn đề phát sinh",
    OTHER: "Khác",
  };

  const handleCheckOut = async (completionNote?: string) => {
    try {
      const failedUploadTypes = await uploadAllStagedImages();

      await checkOut({
        scheduleId,
        completion_note: completionNote?.trim() || null,
      }).unwrap();

      await refetchBookingSchedules();
      await refetchMineSchedules();

      if (failedUploadTypes.length > 0) {
        Alert.alert(
          "Đã hoàn thành",
          "Buổi làm đã được hoàn thành nhưng một số ảnh chưa tải lên được.",
        );
      } else {
        Alert.alert("Đã hoàn thành", "Bạn đã hoàn thành buổi làm việc.");
      }
    } catch (err) {
      await verifyScheduleMutation({
        err,
        scheduleId,
        refetch: refetchBookingSchedules,
        isNowSuccess: (s) => s.status === "COMPLETED",
        successTitle: "Đã hoàn thành",
        successMessage: "Bạn đã hoàn thành buổi làm việc.",
        errorTitle: "Không thể hoàn thành",
        onSuccess: () => refetchMineSchedules(),
      });
    }
  };

  const handlePickImage = (imageType: ScheduleImageType, file: PickedFile) => {
    setLocalImages((prev) => ({
      ...prev,
      [imageType]: [...(prev[imageType] ?? []), file],
    }));
  };

  const handleRemoveStagedImage = (
    imageType: ScheduleImageType,
    uri: string,
  ) => {
    setLocalImages((prev) => ({
      ...prev,
      [imageType]: (prev[imageType] ?? []).filter((f) => f.uri !== uri),
    }));
  };

  return {
    validSelected,
    allSelected,
    selectedIncome,
    toggleAll,

    expandedSessionId,
    sessionCancelReason,
    setSessionCancelReason,
    handleSessionPress,
    handleCancelSession,
    isCancelling,

    reason,
    setReason,
    showCancelForm,
    setShowCancelForm,
    handleCancel,

    handleClaim,
    isClaiming,
    handleClaimSelected,
    isClaimingPackage,

    handleCheckIn,
    isCheckingIn,
    handleCheckOut,
    isCheckingOut: isCheckingOut || isUploadingImages,

    handleOpenChat,
    openingChat,

    localImages,
    handlePickImage,
    handleRemoveStagedImage,

    successModal,
    closeSuccessModal,
  };
}
