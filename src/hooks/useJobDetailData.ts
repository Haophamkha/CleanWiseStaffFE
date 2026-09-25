import { useMemo } from "react";

import {
  useGetAvailableSchedulesQuery,
  useGetBookingSchedulesQuery,
  useGetMySchedulesQuery,
} from "@/services/jobsApi";
import type { WorkerMySchedule, WorkerSchedule } from "@/types/Schedule";

type Args = {
  scheduleId: number;
  isMine: boolean;
  isSingleSessionView: boolean;
  paramBookingId?: number;
};

export function useJobDetailData({
  scheduleId,
  isMine,
  isSingleSessionView,
  paramBookingId,
}: Args) {
  const seedQuery = useGetAvailableSchedulesQuery(undefined, {
    skip: isMine || !!paramBookingId,
    refetchOnMountOrArgChange: true,
  });
  const seedBookingId = seedQuery.data?.find(
    (s) => s.id === scheduleId,
  )?.booking_id;
  const bookingId = paramBookingId ?? seedBookingId;

  const bookingSchedulesQuery = useGetBookingSchedulesQuery(
    bookingId as number,
    {
      skip: !bookingId,
      refetchOnMountOrArgChange: true,
    },
  );
  const mineQuery = useGetMySchedulesQuery(
    paramBookingId ? { booking_id: paramBookingId } : undefined,
    { skip: !isMine, refetchOnMountOrArgChange: true },
  );

  const bookingSchedules = useMemo<WorkerSchedule[]>(
    () => bookingSchedulesQuery.data ?? [],
    [bookingSchedulesQuery.data],
  );

  const item = useMemo<WorkerSchedule | WorkerMySchedule | undefined>(() => {
    if (isMine) {
      return (
        mineQuery.data?.find((s) => s.id === scheduleId) ??
        bookingSchedules.find((s) => s.id === scheduleId)
      );
    }
    return (
      bookingSchedules.find((s) => s.id === scheduleId) ?? bookingSchedules[0]
    );
  }, [isMine, mineQuery.data, bookingSchedules, scheduleId]);

  const mineItem = isMine ? (item as WorkerMySchedule | undefined) : undefined;

  const openSessions = useMemo(
    () =>
      bookingSchedules.filter(
        (s) => s.claim_state === "OPEN" && s.status === "PENDING",
      ),
    [bookingSchedules],
  );

  const waitingSeed = !isMine && !paramBookingId && seedQuery.isLoading;
  const isLoading = isMine
    ? mineQuery.isLoading
    : waitingSeed || bookingSchedulesQuery.isLoading;

  const totalSessions = item?.total_sessions ?? 1;
  const isPackage = totalSessions > 1 && !isSingleSessionView;

  const refetchBookingSchedules = () => bookingSchedulesQuery.refetch();

  const refetchMineSchedules = () =>
    isMine ? mineQuery.refetch() : Promise.resolve(mineQuery);

  return {
    item,
    mineItem,
    bookingSchedules,
    openSessions,
    isLoading,
    isPackage,
    totalSessions,
    bookingId,
    bookingSchedulesQuery,
    mineQuery,
    refetchBookingSchedules,
    refetchMineSchedules,
  };
}
