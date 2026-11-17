import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import {
  useGetAvailableSchedulesQuery,
  useGetBookingSchedulesQuery,
  useGetMySchedulesQuery,
} from "@/features/job/api/jobsApi";
import type {
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";

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
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));
  const dispatch = useAppDispatch();
  const seedQuery = useGetAvailableSchedulesQuery(undefined, {
    skip: isMine || !!paramBookingId,
    refetchOnMountOrArgChange: true,
  });
  const seedBookingId = seedQuery.data?.find(
    (s) => s.id === scheduleId,
  )?.booking_id;
  const mineQuery = useGetMySchedulesQuery(
    paramBookingId ? { booking_id: paramBookingId } : undefined,
    { skip: !isMine, refetchOnMountOrArgChange: true, refetchOnFocus: true },
  );
  const mineSchedule = mineQuery.currentData?.find((s) => s.id === scheduleId);
  const bookingId = paramBookingId ?? seedBookingId ?? mineSchedule?.booking_id;

  const bookingSchedulesQuery = useGetBookingSchedulesQuery(
    bookingId as number,
    {
      skip: !bookingId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );
  useChatSocket(focused && !!bookingId, (event) => {
    if (event.booking_id === bookingId && bookingId &&
        (event.type === "booking.changed" || event.type === "booking.watch.ready")) {
      dispatch(baseApi.util.invalidateTags([
        { type: "BookingSchedules", id: bookingId },
        ...(isMine ? [{ type: "MySchedules" as const, id: "LIST" }] : []),
      ]));
    }
  }, undefined, bookingId);

  const bookingSchedules = useMemo<WorkerSchedule[]>(
    () => bookingSchedulesQuery.data ?? [],
    [bookingSchedulesQuery.data],
  );

  const item = useMemo<WorkerSchedule | WorkerMySchedule | undefined>(() => {
    if (isMine) {
      return (
        mineSchedule ??
        bookingSchedules.find((s) => s.id === scheduleId)
      );
    }
    return bookingSchedules.find((s) => s.id === scheduleId);
  }, [isMine, mineSchedule, bookingSchedules, scheduleId]);

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
