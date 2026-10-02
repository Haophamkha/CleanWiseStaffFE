import { useGetMySchedulesQuery } from "@/features/job/api/jobsApi";
import type {
  ScheduleStatus,
  WorkerMySchedule,
} from "@/features/schedule/types/Schedule";
import { useSingleNavigate } from "@/hooks/useSingleNavigate";
import { formatCurrency, formatTime, pad2 } from "@/utils/format";
import { router } from "expo-router";
import { useMemo, useState } from "react";

const WEEKDAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKDAY_FULL = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export type WeekDayCell = {
  key: string;
  date: Date;
  weekday: string;
  dayNumber: number;
  selected: boolean;
  isToday: boolean;
  hasJobs: boolean;
};

export type ScheduleRow = {
  id: number;
  status: ScheduleStatus;
  startLabel: string;
  endLabel: string;
  durationLabel: string;
  service: string;
  location: string;
  priceLabel: string;
  isLast: boolean;
};

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesBetween(startIso: string, endIso: string) {
  return Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
}

function formatLength(startIso: string, endIso: string) {
  const total = minutesBetween(startIso, endIso);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h}h${m}`;
}

function formatTotalHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

export function useSchedule() {
  const navigateOnce = useSingleNavigate();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { data, isLoading, isFetching, refetch } =
    useGetMySchedulesQuery(undefined);

  const schedules = useMemo(() => (data ?? []) as WorkerMySchedule[], [data]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const schedulesByDay = useMemo(
    () =>
      weekDays.map((day) =>
        schedules
          .filter((s) => isSameDay(new Date(s.scheduled_start), day))
          .sort(
            (a, b) =>
              new Date(a.scheduled_start).getTime() -
              new Date(b.scheduled_start).getTime(),
          ),
      ),
    [weekDays, schedules],
  );

  const selectedIndex = weekDays.findIndex((d) => isSameDay(d, selectedDate));
  const selectedList = selectedIndex >= 0 ? schedulesByDay[selectedIndex] : [];

  const days = useMemo<WeekDayCell[]>(() => {
    const today = new Date();
    return weekDays.map((date, i) => ({
      key: date.toISOString(),
      date,
      weekday: WEEKDAY_SHORT[i],
      dayNumber: date.getDate(),
      selected: isSameDay(date, selectedDate),
      isToday: isSameDay(date, today),
      hasJobs: schedulesByDay[i].length > 0,
    }));
  }, [weekDays, schedulesByDay, selectedDate]);

  const rows = useMemo<ScheduleRow[]>(
    () =>
      selectedList.map((s, index) => ({
        id: s.id,
        status: s.status,
        startLabel: formatTime(s.scheduled_start),
        endLabel: formatTime(s.scheduled_end),
        durationLabel: formatLength(s.scheduled_start, s.scheduled_end),
        service: s.service_name,
        location: `${s.address_ward ? `${s.address_ward}, ` : ""}${s.address_city}`,
        priceLabel: formatCurrency(s.price) ?? "—",
        isLast: index === selectedList.length - 1,
      })),
    [selectedList],
  );

  const totalMinutes = selectedList.reduce(
    (total, s) =>
      total + Math.max(0, minutesBetween(s.scheduled_start, s.scheduled_end)),
    0,
  );
  const totalIncome = selectedList.reduce((sum, s) => {
    const value = Number(s.price ?? 0);
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);

  const goPrevWeek = () => {
    const next = addDays(weekStart, -7);
    setWeekStart(next);
    setSelectedDate(next);
  };
  const goNextWeek = () => {
    const next = addDays(weekStart, 7);
    setWeekStart(next);
    setSelectedDate(next);
  };
  const goToday = () => {
    const now = new Date();
    setWeekStart(getWeekStart(now));
    setSelectedDate(now);
  };

  return {
    isLoading,
    isRefreshing: isFetching,
    refresh: refetch,
    monthLabel: `Tháng ${weekStart.getMonth() + 1}`,
    yearLabel: String(weekStart.getFullYear()),
    days,
    dayTitle: WEEKDAY_FULL[selectedIndex >= 0 ? selectedIndex : 0],
    dateLabel: `${pad2(selectedDate.getDate())}/${pad2(selectedDate.getMonth() + 1)}/${selectedDate.getFullYear()}`,
    rows,
    summary: {
      count: selectedList.length,
      hoursLabel: formatTotalHours(totalMinutes),
      incomeLabel: formatCurrency(totalIncome) ?? "—",
    },
    selectDay: setSelectedDate,
    goPrevWeek,
    goNextWeek,
    goToday,
    goBack: () =>
      router.canGoBack() ? router.back() : router.replace("/(tabs)/home"),
    openSchedule: (id: number) =>
      navigateOnce(() =>
        router.push({
          pathname: "/jobs/[id]",
          params: { id: String(id), source: "mine" },
        }),
      ),
    goAvailableJobs: () =>
      router.push({
        pathname: "/(tabs)/jobs",
        params: { tab: "available" },
      }),
  };
}
