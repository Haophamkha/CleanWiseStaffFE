import type { PaymentStatus, WorkerSchedule } from "@/types/Schedule";
import { startOfDay } from "@/utils/format";

export const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Chờ thực hiện", color: "#B45309", bg: "#FEF3C7" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "#1D4ED8", bg: "#DBEAFE" },
  COMPLETED: { label: "Hoàn thành", color: "#15803D", bg: "#DCFCE7" },
  CANCELLED: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  MISSED: { label: "Đã bỏ lỡ", color: "#B91C1C", bg: "#FEE2E2" },
};

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  UNPAID: { label: "Chưa thanh toán", bg: "#FEF3C7", text: "#92400E" },
  PAID: { label: "Đã thanh toán", bg: "#D1FAE5", text: "#047857" },
  REFUNDED: { label: "Đã hoàn tiền", bg: "#E5E7EB", text: "#374151" },
};

export const CHECKIN_EARLY_MINUTES = 60;

export function getCheckInAvailability(scheduledStartIso: string) {
  const earliestMs =
    new Date(scheduledStartIso).getTime() - CHECKIN_EARLY_MINUTES * 60_000;
  if (Date.now() >= earliestMs) {
    return { canStart: true as const };
  }
  const earliest = new Date(earliestMs);
  const sameDay = startOfDay(earliest) === startOfDay(new Date());
  const label = sameDay
    ? earliest.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : earliest.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
  return { canStart: false as const, availableAtLabel: label };
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
