import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

import { useLazyGetAssignmentConversationQuery } from "@/services/chatApi";
import {
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useClaimBookingPackageMutation,
  useClaimScheduleMutation,
  useUploadScheduleImageMutation,
} from "@/services/jobsApi";
import type {
  ScheduleImageType,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/types/Schedule";
import type { PickedFile } from "@/types/WorkerProfile";
import { getErrorMessage, isNetworkError } from "@/utils/apiError";
import { formatDayLabel, formatTime } from "@/utils/format";
import { getSessionInteraction } from "@/utils/scheduleStatus";
import { verifyScheduleMutation } from "@/utils/verifyMutation";

type Args = {
  scheduleId: number;
  isMine: boolean;
  item: WorkerSchedule | WorkerMySchedule | undefined;
  mineItem: WorkerMySchedule | undefined;
  bookingId: number | undefined;
  bookingSchedules: WorkerSchedule[];
  openSessions: WorkerSchedule[];
  refetchBookingSchedules: () => Promise<{ data?: WorkerSchedule[] }>;
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
  /* ----- Chọn nhiều buổi để nhận cùng lúc (gói) ----- */
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

  const toggleSession = (sid: number) =>
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  const toggleAll = () =>
    setSelected(allSelected ? [] : openSessions.map((s) => s.id));

  /* ----- Hủy 1 buổi trong gói (còn xa giờ làm) ----- */
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(
    null,
  );
  const [sessionCancelReason, setSessionCancelReason] = useState("");

  /* ----- Hủy buổi lẻ (không phải gói) ----- */
  const [reason, setReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  /* ----- Modal thành công ----- */
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    details?: string[];
  }>({ visible: false, title: "" });
  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, visible: false }));
    router.back();
  };
  const openSuccessModal = (payload: {
    title: string;
    message?: string;
    details?: string[];
  }) => setSuccessModal({ visible: true, ...payload });

  const [localImages, setLocalImages] = useState<
    Partial<Record<ScheduleImageType, PickedFile[]>>
  >({});

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  /* ----- Mutations ----- */
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

  /* ----- Điều hướng khi bấm vào 1 buổi trong "Các buổi trong gói" ----- */
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
      }).unwrap();
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
          setExpandedSessionId(null);
          setSessionCancelReason("");
        },
      });
    }
  };

  /* ----- Nhận 1 buổi lẻ (không phải gói) ----- */
  const handleClaim = async () => {
    const successMessage = item
      ? `${item.service_name} · ${formatDayLabel(item.scheduled_start)}, ${formatTime(item.scheduled_start)} - ${formatTime(item.scheduled_end)}`
      : "Bạn đã nhận buổi làm này.";
    try {
      await claimSchedule(scheduleId).unwrap();
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
        onSuccess: () =>
          openSuccessModal({
            title: "Nhận việc thành công",
            message: successMessage,
          }),
      });
    }
  };

  /* ----- Nhận nhiều buổi đã chọn trong gói ----- */
  const handleClaimSelected = async () => {
    if (!bookingId || validSelected.length === 0) return;
    const attemptedIds = [...validSelected];
    try {
      const res: any = await claimPackage({
        bookingId,
        scheduleIds: attemptedIds,
      }).unwrap();

      const payload = res?.data ?? res;
      const claimed: { schedule_id: number }[] = payload?.claimed ?? [];
      const skipped: { schedule_id: number; reason: string }[] =
        payload?.skipped ?? [];

      const details = skipped.map((sk) => {
        const s = bookingSchedules.find((x) => x.id === sk.schedule_id);
        const label = s
          ? `${formatDayLabel(s.scheduled_start)}, ${formatTime(s.scheduled_start)}`
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
            setSelected((prev) => prev.filter((sid) => !nowMine.includes(sid)));
            openSuccessModal({
              title: "Nhận việc thành công",
              message: `Bạn đã nhận ${nowMine.length} buổi làm việc. (Kết nối mạng bị gián đoạn lúc nhận thông báo, nhưng hệ thống đã ghi nhận buổi làm của bạn.)`,
            });
            return;
          }
        } catch {
          // vẫn mất mạng, không xác minh được -> rơi xuống báo lỗi bên dưới
        }
      }

      Alert.alert("Không thể nhận việc", getErrorMessage(err));
    }
  };

  /* ----- Hủy buổi lẻ (không phải gói) ----- */
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
      }).unwrap();
      Alert.alert("Đã hủy", "Bạn đã hủy nhận buổi làm này.", [
        { text: "OK", onPress: () => router.back() },
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
        onSuccess: () => router.back(),
      });
    }
  };

  /* ----- Mở chat với khách ----- */
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

  /* ----- Check-in ----- */
  const handleCheckIn = async () => {
    try {
      await checkIn(scheduleId).unwrap();
      refetchBookingSchedules();
      refetchMineSchedules();
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

  /* ----- Upload toàn bộ ảnh đang chờ (mọi loại) — gọi ngay trước
   * checkOut. Trả về danh sách loại ảnh nào bị lỗi (nếu có), KHÔNG throw
   * — vì BE chưa bắt buộc phải có ảnh mới cho hoàn thành, nên dù ảnh lỗi
   * vẫn phải để checkout tiếp tục chạy. Ảnh lỗi được giữ lại trong
   * localImages (không xóa) để người dùng còn cơ hội gửi bù sau. */
  const uploadAllStagedImages = async (): Promise<ScheduleImageType[]> => {
    const entries = Object.entries(localImages) as [
      ScheduleImageType,
      PickedFile[],
    ][];
    const pendingEntries = entries.filter(([, files]) => files.length > 0);
    if (pendingEntries.length === 0) return [];

    setIsUploadingImages(true);
    const failedTypes = new Set<ScheduleImageType>();
    const stillPending: Partial<Record<ScheduleImageType, PickedFile[]>> = {};

    for (const [imageType, files] of pendingEntries) {
      const results = await Promise.allSettled(
        files.map((file) =>
          uploadImage({ scheduleId, image: file, imageType }).unwrap(),
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

  /* ----- Hoàn thành công việc: gửi hết ảnh đang chờ RỒI mới check-out ----- */
  const handleCheckOut = () => {
    Alert.alert(
      "Xác nhận hoàn thành",
      "Bạn chắc chắn đã hoàn thành công việc này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            // 1) Gửi hết ảnh đang chờ trước — không chặn nếu lỗi (BE
            // chưa bắt buộc), chỉ ghi nhận loại nào lỗi để báo sau.
            const failedTypes = await uploadAllStagedImages();

            // 2) Check-out như cũ.
            try {
              await checkOut(scheduleId).unwrap();
              refetchBookingSchedules();
              refetchMineSchedules();

              const failedNote =
                failedTypes.length > 0
                  ? `\n\nLưu ý: ${failedTypes.map((t) => IMAGE_TYPE_LABEL[t]).join(", ")} chưa gửi được, bạn có thể thử gửi lại.`
                  : "";

              Alert.alert(
                "Hoàn thành",
                `Bạn đã hoàn thành buổi làm việc.${failedNote}`,
                [{ text: "OK", onPress: () => router.back() }],
              );
            } catch (err) {
              await verifyScheduleMutation({
                err,
                scheduleId,
                refetch: refetchBookingSchedules,
                isNowSuccess: (s) => s.status === "COMPLETED",
                successTitle: "Hoàn thành",
                successMessage: "Bạn đã hoàn thành buổi làm việc.",
                errorTitle: "Không thể hoàn thành",
                onSuccess: () => router.back(),
              });
            }
          },
        },
      ],
    );
  };

  /* ----- Ảnh minh chứng: chọn -> chờ -> xóa (X) ----- */

  // Bấm ô "Thêm" (ImageUploadBox) -> CHỈ đưa vào hàng chờ, KHÔNG gọi API.
  // Gửi thật sự chỉ xảy ra khi bấm "Hoàn thành công việc" (xem
  // uploadAllStagedImages ở trên).
  const handlePickImage = (imageType: ScheduleImageType, file: PickedFile) => {
    setLocalImages((prev) => ({
      ...prev,
      [imageType]: [...(prev[imageType] ?? []), file],
    }));
  };

  // Bấm dấu X trên 1 ảnh đang chờ -> bỏ khỏi hàng chờ. Ảnh này chưa từng
  // được gửi lên server nên không cần huỷ gì phía BE.
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
    // chọn nhiều buổi
    validSelected,
    allSelected,
    selectedIncome,
    toggleAll,
    // hủy buổi trong gói
    expandedSessionId,
    sessionCancelReason,
    setSessionCancelReason,
    handleSessionPress,
    handleCancelSession,
    isCancelling,
    // hủy buổi lẻ
    reason,
    setReason,
    showCancelForm,
    setShowCancelForm,
    handleCancel,
    // nhận việc
    handleClaim,
    isClaiming,
    handleClaimSelected,
    isClaimingPackage,
    // check-in/out
    handleCheckIn,
    isCheckingIn,
    handleCheckOut,
    isCheckingOut: isCheckingOut || isUploadingImages,
    // chat
    handleOpenChat,
    openingChat,
    // ảnh
    localImages,
    handlePickImage,
    handleRemoveStagedImage,
    // modal thành công
    successModal,
    closeSuccessModal,
  };
}
