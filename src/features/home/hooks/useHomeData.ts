import { ENV } from "@/config/env";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import { useGetMySchedulesQuery } from "@/features/job/api/jobsApi";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import { useMemo } from "react";
import { Linking } from "react-native";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

function formatHours(totalHours: number) {
  return Number.isInteger(totalHours)
    ? String(totalHours)
    : totalHours.toFixed(1);
}

export function useHomeData() {
  const { data: profile, isLoading } = useGetWorkerProfileQuery();
  const isActive = profile?.status === "ACTIVE";

  const { data: mySchedules, isLoading: isLoadingSchedules } =
    useGetMySchedulesQuery(undefined, { skip: !isActive });

  const todaySchedules = useMemo(() => {
    const today = new Date();
    return ((mySchedules ?? []) as WorkerMySchedule[])
      .filter((s) => isSameDay(new Date(s.scheduled_start), today))
      .sort(
        (a, b) =>
          new Date(a.scheduled_start).getTime() -
          new Date(b.scheduled_start).getTime(),
      );
  }, [mySchedules]);

  const totalHoursToday = useMemo(
    () =>
      todaySchedules.reduce((sum, s) => {
        const ms =
          new Date(s.scheduled_end).getTime() -
          new Date(s.scheduled_start).getTime();
        return sum + ms / 3600000;
      }, 0),
    [todaySchedules],
  );

  const totalIncomeToday = useMemo(
    () =>
      todaySchedules.reduce((sum, s) => {
        const val = Number(s.price);
        return sum + (Number.isNaN(val) ? 0 : val);
      }, 0),
    [todaySchedules],
  );

  const openDirections = (s: WorkerMySchedule) => {
    if (!s.address_latitude || !s.address_longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${s.address_latitude},${s.address_longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const workerName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username ||
      "bạn"
    : "bạn";

  const workerAvatar = profile?.portrait
    ? profile.portrait.startsWith("http")
      ? profile.portrait
      : `${ENV.API_URL}${profile.portrait}`
    : null;

  return {
    profile,
    isLoading,
    isActive,
    isLoadingSchedules,
    todaySchedules,
    stats: {
      count: todaySchedules.length,
      hours: formatHours(totalHoursToday),
      income: formatCurrency(totalIncomeToday) ?? "—",
    },
    workerName,
    workerAvatar,
    openDirections,
  };
}
