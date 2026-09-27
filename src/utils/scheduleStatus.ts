import type { PaymentStatus, WorkerSchedule } from "@/types/Schedule";
import { startOfDay } from "@/utils/format";

export const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    color: "#B45309",
    bg: "#FEF3C7",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "#15803D",
    bg: "#DCFCE7",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
  MISSED: {
    label: "Đã bỏ lỡ",
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
};

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  UNPAID: {
    label: "Chưa thanh toán",
    bg: "#FEF3C7",
    text: "#92400E",
  },
  PAID: {
    label: "Đã thanh toán",
    bg: "#D1FAE5",
    text: "#047857",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    bg: "#E5E7EB",
    text: "#374151",
  },
};

// ĐỔI: đồng bộ 2 chiều với BE (CHECKIN_EARLY_MINUTES / CHECKIN_LATE_MINUTES
// trong apps/worker/checkin_service.py). Trước đây chỉ chặn sớm, không
// chặn trễ -> worker vẫn thấy nút Check-in sau khi đã quá hạn 60 phút,
// bấm vào mới bị BE từ chối.
export const CHECKIN_EARLY_MINUTES = 60;
export const CHECKIN_LATE_MINUTES = 60;

type CheckInAvailability =
  | { canStart: true }
  | { canStart: false; reason: "too_early"; availableAtLabel: string }
  | { canStart: false; reason: "too_late" };

function formatTimeLabel(date: Date) {
  const sameDay = startOfDay(date) === startOfDay(new Date());
  return sameDay
    ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function getCheckInAvailability(
  scheduledStartIso: string,
): CheckInAvailability {
  const scheduledStartMs = new Date(scheduledStartIso).getTime();
  const earliestMs = scheduledStartMs - CHECKIN_EARLY_MINUTES * 60_000;
  const latestMs = scheduledStartMs + CHECKIN_LATE_MINUTES * 60_000;
  const now = Date.now();

  if (now < earliestMs) {
    return {
      canStart: false,
      reason: "too_early",
      availableAtLabel: formatTimeLabel(new Date(earliestMs)),
    };
  }
  if (now > latestMs) {
    return { canStart: false, reason: "too_late" };
  }
  return { canStart: true };
}

export function getSessionInteraction(
  session: WorkerSchedule,
): "expand-cancel" | "navigate" | "none" {
  if (session.claim_state !== "MINE") return "none";
  if (session.status === "IN_PROGRESS") return "navigate";
  if (session.status === "COMPLETED") return "navigate";
  if (session.status === "PENDING") {
    return getCheckInAvailability(session.scheduled_start).canStart
      ? "navigate"
      : "expand-cancel";
  }
  return "none";
}
