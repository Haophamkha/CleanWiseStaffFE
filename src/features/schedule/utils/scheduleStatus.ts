import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
import type { ThemeColors } from "@/constants/theme";
import { getScheduleStatus } from "@/components/ui/StatusBadge";

import type {
  PaymentStatus,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { startOfDay } from "@/utils/format";

export const getStatusLabel = getScheduleStatus;

export function getPaymentStatusMap(COLORS: ThemeColors, translateText = defaultTranslate): Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> { return {
  UNPAID: {
    label: translateText("Chưa thanh toán"),
    bg: COLORS.warningLight,
    text: COLORS.warningDark,
  },
  PAID: {
    label: translateText("Đã thanh toán"),
    bg: COLORS.successLight,
    text: COLORS.success,
  },
  REFUNDED: {
    label: translateText("Đã hoàn tiền"),
    bg: COLORS.accentLight,
    text: COLORS.inkSoft,
  },
}; }

// Đồng bộ 2 chiều với BE (CHECKIN_EARLY_MINUTES / CHECKIN_LATE_MINUTES
// trong apps/worker/checkin_service.py).
export const CHECKIN_EARLY_MINUTES = 60;
export const CHECKIN_LATE_MINUTES = 60;

type CheckInAvailability =
  | { canStart: true }
  | { canStart: false; reason: "too_early"; availableAtLabel: string }
  | { canStart: false; reason: "too_late" };

function formatTimeLabel(date: Date, translateText = defaultTranslate) {
  const sameDay = startOfDay(date) === startOfDay(new Date());
  return sameDay
    ? date.toLocaleTimeString(getLocale(translateText), { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleString(getLocale(translateText), {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function getCheckInAvailability(
  scheduledStartIso: string, translateText = defaultTranslate,
): CheckInAvailability {
  const scheduledStartMs = new Date(scheduledStartIso).getTime();
  const earliestMs = scheduledStartMs - CHECKIN_EARLY_MINUTES * 60_000;
  const latestMs = scheduledStartMs + CHECKIN_LATE_MINUTES * 60_000;
  const now = Date.now();

  if (now < earliestMs) {
    return {
      canStart: false,
      reason: "too_early",
      availableAtLabel: formatTimeLabel(new Date(earliestMs), translateText),
    };
  }
  if (now > latestMs) {
    return { canStart: false, reason: "too_late" };
  }
  return { canStart: true };
}

export function getCheckOutAvailability(
  schedule: Pick<WorkerMySchedule, "scheduled_end" | "check_out_until">,
  translateText = defaultTranslate,
  now = Date.now(),
): { canFinish: true } | { canFinish: false; message: string } {
  const end = new Date(schedule.scheduled_end).getTime();
  if (!Number.isFinite(end)) {
    return { canFinish: false, message: translateText("Không xác định được giờ kết thúc.") };
  }
  if (now < end) {
    return {
      canFinish: false,
      message: translateText("Có thể check-out từ {{value0}}", {
        value0: formatTimeLabel(new Date(end), translateText),
      }),
    };
  }
  // Cached responses from older versions of the API may omit the deadline.
  const deadline = schedule.check_out_until
    ? new Date(schedule.check_out_until).getTime()
    : end + 30 * 60_000;
  if (!Number.isFinite(deadline) || now > deadline) {
    return { canFinish: false, message: translateText("Đã hết hạn tự check-out") };
  }
  return { canFinish: true };
}

export function getSessionInteraction(
  session: WorkerSchedule, translateText = defaultTranslate,
): "expand-cancel" | "navigate" | "none" {
  if (session.claim_state !== "MINE") return "none";
  if (session.status === "IN_PROGRESS") return "navigate";
  if (session.status === "COMPLETED") return "navigate";
  if (session.status === "PENDING") {
    return getCheckInAvailability(session.scheduled_start, translateText).canStart
      ? "navigate"
      : "expand-cancel";
  }
  return "none";
}
