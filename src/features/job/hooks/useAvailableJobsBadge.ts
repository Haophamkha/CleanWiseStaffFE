import { useGetAvailableJobsPagedQuery } from "@/features/job/api/jobsApi";
import type { AvailableJobsPagedArgs } from "@/features/schedule/types/Schedule";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useRef } from "react";

/** Số đơn đang chờ nhận, dùng cho badge ở tab "Công việc". */
export function useAvailableJobsBadge(): string | undefined {
  const { data, refetch } = useGetAvailableJobsPagedQuery({
    page: 1,
    page_size: 1,
  } as AvailableJobsPagedArgs);

  // Cập nhật khi có thông báo / realtime mới
  const refreshTick = useAppSelector((s) => s.notification.refreshTick);
  const lastTick = useRef(refreshTick);
  useEffect(() => {
    if (lastTick.current === refreshTick) return;
    lastTick.current = refreshTick;
    refetch();
  }, [refreshTick, refetch]);

  const count = data?.count ?? 0;
  if (count <= 0) return undefined;
  return count > 99 ? "99+" : String(count);
}