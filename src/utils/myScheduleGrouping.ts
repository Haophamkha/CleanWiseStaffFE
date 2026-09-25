import type { WorkerMySchedule } from "@/types/Schedule";

export type MyDisplayItem =
  | { type: "single"; item: WorkerMySchedule }
  | { type: "package"; bookingId: number; sessions: WorkerMySchedule[] };

export function groupMySchedules(items: WorkerMySchedule[]): MyDisplayItem[] {
  const bucket = new Map<number, WorkerMySchedule[]>();
  const order: number[] = [];

  for (const it of items) {
    if (!bucket.has(it.booking_id)) {
      bucket.set(it.booking_id, []);
      order.push(it.booking_id);
    }
    bucket.get(it.booking_id)!.push(it);
  }

  return order.map((bookingId) => {
    const sessions = bucket.get(bookingId)!;
    const total = sessions[0].total_sessions ?? sessions.length;
    return total > 1
      ? { type: "package" as const, bookingId, sessions }
      : { type: "single" as const, item: sessions[0] };
  });
}
