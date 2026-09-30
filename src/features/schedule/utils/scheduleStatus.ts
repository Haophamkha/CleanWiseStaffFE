import { SCHEDULE_STATUS } from "@/components/ui/StatusBadge";
import { COLORS } from "@/constants/theme";
import type {
  PaymentStatus,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { startOfDay } from "@/utils/format";

export const STATUS_LABEL = SCHEDULE_STATUS;

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  UNPAID: {
    label: "Chưa thanh toán",
    bg: COLORS.warningLight,
    text: COLORS.warningDark,
  },
  PAID: {
    label: "Đã thanh toán",
    bg: COLORS.successLight,
    text: COLORS.success,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    bg: COLORS.accentLight,
    text: COLORS.inkSoft,
  },
};

// Đồng bộ 2 chiều với BE (CHECKIN_EARLY_MINUTES / CHECKIN_LATE_MINUTES
// trong apps/worker/checkin_service.py).
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
