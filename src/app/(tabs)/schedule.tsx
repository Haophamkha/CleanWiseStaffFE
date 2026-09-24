import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { useGetMySchedulesQuery } from "@/services/jobsApi";
import type { WorkerMySchedule } from "@/types/Schedule";

const STATUS_STYLE: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
  }
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

const MONTH_NAMES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
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

function formatTime(iso: string) {
  const d = new Date(iso);

  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function formatDuration(startIso: string, endIso: string) {
  const totalMin = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;

  return `${h}h${m}`;
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  const num = Number(value);

  if (Number.isNaN(num)) return null;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

function getTotalMinutes(schedules: WorkerMySchedule[]) {
  return schedules.reduce((total, s) => {
    const start = new Date(s.scheduled_start).getTime();
    const end = new Date(s.scheduled_end).getTime();

    return total + Math.max(0, Math.round((end - start) / 60000));
  }, 0);
}

function formatTotalHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}p`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h${mins}`;
}

function ScheduleContent() {
  const insets = useSafeAreaInsets();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { data, isLoading, isFetching, refetch } =
    useGetMySchedulesQuery(undefined);

  const schedules = (data ?? []) as WorkerMySchedule[];

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

  const selectedDayIndex = weekDays.findIndex((d) =>
    isSameDay(d, selectedDate),
  );

  const selectedList =
    selectedDayIndex >= 0 ? schedulesByDay[selectedDayIndex] : [];

  const today = new Date();

  const totalMinutes = getTotalMinutes(selectedList);

  const totalIncome = selectedList.reduce((sum, item) => {
    const value = Number(item.price ?? 0);

    return Number.isNaN(value) ? sum : sum + value;
  }, 0);

  const goPrevWeek = () => {
    const newStart = addDays(weekStart, -7);

    setWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const goNextWeek = () => {
    const newStart = addDays(weekStart, 7);

    setWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const goToday = () => {
    const now = new Date();

    setWeekStart(getWeekStart(now));
    setSelectedDate(now);
  };

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      {/* ================= HEADER ================= */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="bg-white px-5 pb-4 border-b border-[#EEF0F4]"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-[#EEF2FF] items-center justify-center mr-3">
              <Feather name="calendar" size={20} color="#2563EB" />
            </View>

            <View>
              <Text className="text-[#111827] text-xl font-bold">
                Lịch làm việc
              </Text>

              <Text className="text-[#9CA3AF] text-xs mt-0.5">
                Theo dõi các ca làm của bạn
              </Text>
            </View>
          </View>

          <Pressable
            onPress={goToday}
            className="px-3.5 py-2 rounded-full bg-[#EFF6FF]"
          >
            <Text className="text-[#2563EB] font-bold text-xs">Hôm nay</Text>
          </Pressable>
        </View>
      </View>

      {/* ================= MONTH NAVIGATION ================= */}
      <View className="bg-white px-5 py-3 border-b border-[#EEF0F4]">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={goPrevWeek}
            hitSlop={10}
            className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center"
          >
            <Feather name="chevron-left" size={20} color="#374151" />
          </Pressable>

          <View className="items-center">
            <Text className="text-[#111827] font-bold text-base">
              Tháng {MONTH_NAMES[weekStart.getMonth()]}
            </Text>

            <Text className="text-[#9CA3AF] text-xs mt-0.5">
              {weekStart.getFullYear()}
            </Text>
          </View>

          <Pressable
            onPress={goNextWeek}
            hitSlop={10}
            className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center"
          >
            <Feather name="chevron-right" size={20} color="#374151" />
          </Pressable>
        </View>
      </View>

      {/* ================= HORIZONTAL DATE PICKER ================= */}
      <View className="bg-white border-b border-[#EEF0F4]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {weekDays.map((day, idx) => {
            const selected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const hasJobs = schedulesByDay[idx].length > 0;

            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                className="mr-2"
              >
                <View
                  style={{
                    backgroundColor: selected ? "#2563EB" : "#F8FAFC",
                    borderColor: selected
                      ? "#2563EB"
                      : isToday
                        ? "#BFDBFE"
                        : "#EEF0F4",
                  }}
                  className="w-[62px] h-[76px] rounded-2xl border items-center justify-center"
                >
                  <Text
                    style={{
                      color: selected ? "#DBEAFE" : "#9CA3AF",
                    }}
                    className="text-[11px] font-semibold mb-1"
                  >
                    {WEEKDAY_SHORT[idx]}
                  </Text>

                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : "#111827",
                    }}
                    className="text-xl font-bold"
                  >
                    {day.getDate()}
                  </Text>

                  <View
                    style={{
                      backgroundColor: hasJobs
                        ? selected
                          ? "#FFFFFF"
                          : "#2563EB"
                        : "transparent",
                    }}
                    className="w-1.5 h-1.5 rounded-full mt-1"
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#2563EB"
            />
          }
          contentContainerStyle={{
            paddingTop: 18,
            paddingHorizontal: 16,
            paddingBottom: 40 + insets.bottom,
          }}
        >
          {/* ================= DATE TITLE ================= */}
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-[#111827] text-xl font-bold">
                {WEEKDAY_FULL[selectedDayIndex >= 0 ? selectedDayIndex : 0]}
              </Text>

              <Text className="text-[#9CA3AF] text-sm mt-0.5">
                {selectedDate.getDate().toString().padStart(2, "0")}/
                {(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/
                {selectedDate.getFullYear()}
              </Text>
            </View>

            {selectedList.length > 0 && (
              <View className="items-end">
                <Text className="text-[#9CA3AF] text-xs">Tổng hôm nay</Text>

                <Text className="text-[#2563EB] font-bold text-base">
                  {formatCurrency(totalIncome) ?? "—"}
                </Text>
              </View>
            )}
          </View>

          {/* ================= SUMMARY ================= */}
          {selectedList.length > 0 && (
            <View className="flex-row mb-5">
              <View className="flex-1 bg-white rounded-2xl p-4 mr-2 border border-[#EEF0F4]">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-xl bg-[#EEF2FF] items-center justify-center mr-2">
                    <Feather name="briefcase" size={15} color="#2563EB" />
                  </View>

                  <Text className="text-[#9CA3AF] text-xs">Số ca</Text>
                </View>

                <Text className="text-[#111827] text-xl font-bold">
                  {selectedList.length}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 ml-2 border border-[#EEF0F4]">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-xl bg-[#ECFDF5] items-center justify-center mr-2">
                    <Feather name="clock" size={15} color="#059669" />
                  </View>

                  <Text className="text-[#9CA3AF] text-xs">Thời gian</Text>
                </View>

                <Text className="text-[#111827] text-xl font-bold">
                  {formatTotalHours(totalMinutes)}
                </Text>
              </View>
            </View>
          )}

          {/* ================= EMPTY ================= */}
          {selectedList.length === 0 ? (
            <View className="bg-white rounded-3xl border border-[#EEF0F4] py-16 px-6 items-center">
              <View className="w-20 h-20 rounded-full bg-[#EEF2FF] items-center justify-center mb-5">
                <Feather name="calendar" size={30} color="#2563EB" />
              </View>

              <Text className="text-[#111827] font-bold text-lg mb-2">
                Chưa có lịch làm
              </Text>

              <Text className="text-[#9CA3AF] text-sm text-center leading-5">
                Ngày này chưa có ca làm việc.
                {"\n"}
                Sang tab "Khả dụng" để nhận thêm việc nhé.
              </Text>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/jobs",
                    params: { tab: "available" },
                  })
                }
                className="mt-5 px-5 py-3 rounded-xl bg-[#2563EB]"
              >
                <Text className="text-white font-bold text-sm">
                  Xem việc khả dụng
                </Text>
              </Pressable>
            </View>
          ) : (
            /* ================= TIMELINE ================= */
            <View>
              {selectedList.map((s, index) => {
                const badge = STATUS_STYLE[s.status] ?? STATUS_STYLE.PENDING;

                const price = formatCurrency(s.price);

                const isLast = index === selectedList.length - 1;

                return (
                  <View key={s.id} className="flex-row">
                    {/* TIME */}
                    <View className="w-[58px] items-end pr-3">
                      <Text className="text-[#111827] text-sm font-bold">
                        {formatTime(s.scheduled_start)}
                      </Text>

                      <Text className="text-[#9CA3AF] text-[11px] mt-1">
                        {formatTime(s.scheduled_end)}
                      </Text>
                    </View>

                    {/* TIMELINE LINE */}
                    <View className="w-5 items-center">
                      <View
                        style={{
                          backgroundColor: badge.color,
                        }}
                        className="w-3 h-3 rounded-full mt-1.5"
                      />

                      {!isLast && (
                        <View className="flex-1 w-[2px] bg-[#E5E7EB] mt-1" />
                      )}
                    </View>

                    {/* JOB CARD */}
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/jobs/[id]",
                          params: {
                            id: String(s.id),
                            source: "mine",
                          },
                        })
                      }
                      className="flex-1 ml-2 mb-5"
                    >
                      <View
                        style={{
                          borderLeftColor: badge.color,
                        }}
                        className="bg-white rounded-2xl border border-[#EEF0F4] border-l-[4px] p-4"
                      >
                        {/* TIME + STATUS */}
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <Feather name="clock" size={14} color="#9CA3AF" />

                            <Text className="text-[#6B7280] text-xs ml-1.5">
                              {formatDuration(
                                s.scheduled_start,
                                s.scheduled_end,
                              )}
                            </Text>
                          </View>

                          <View
                            style={{
                              backgroundColor: badge.bg,
                            }}
                            className="px-2.5 py-1 rounded-full"
                          >
                            <Text
                              style={{
                                color: badge.color,
                              }}
                              className="text-[10px] font-bold"
                            >
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        {/* SERVICE */}
                        <Text className="text-[#111827] text-base font-bold mb-2">
                          {s.service_name}
                        </Text>

                        {/* LOCATION */}
                        <View className="flex-row items-start mb-4">
                          <Feather
                            name="map-pin"
                            size={15}
                            color="#9CA3AF"
                            style={{ marginTop: 2 }}
                          />

                          <Text
                            numberOfLines={2}
                            className="text-[#6B7280] text-sm ml-2 flex-1 leading-5"
                          >
                            {s.address_ward ? `${s.address_ward}, ` : ""}
                            {s.address_city}
                          </Text>
                        </View>

                        {/* FOOTER */}
                        <View className="pt-3 border-t border-[#F3F4F6] flex-row items-center justify-between">
                          <View>
                            <Text className="text-[#9CA3AF] text-[11px] mb-0.5">
                              Thu nhập
                            </Text>

                            <Text className="text-[#2563EB] font-bold text-base">
                              {price ?? "—"}
                            </Text>
                          </View>

                          <View className="w-9 h-9 rounded-full bg-[#F8FAFC] items-center justify-center">
                            <Feather
                              name="chevron-right"
                              size={18}
                              color="#9CA3AF"
                            />
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function ScheduleScreen() {
  return (
    <ActiveProfileGate>
      <ScheduleContent />
    </ActiveProfileGate>
  );
}
