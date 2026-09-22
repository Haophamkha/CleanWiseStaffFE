import { ProfileStatusCard } from "@/components/common/ProfileStatusCard";
import { ENV } from "@/config/env";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import { useGetMySchedulesQuery } from "@/services/jobsApi";
import type { WorkerMySchedule } from "@/types/Schedule";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_STYLE: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Chờ thực hiện", color: "#B45309", bg: "#FEF3C7" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "#1D4ED8", bg: "#DBEAFE" },
  COMPLETED: { label: "Hoàn thành", color: "#15803D", bg: "#DCFCE7" },
  CANCELLED: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  MISSED: { label: "Đã bỏ lỡ", color: "#B91C1C", bg: "#FEE2E2" },
};

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

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center">
      <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-2">
        <Feather name={icon} size={22} color="#2563EB" />
      </View>
      <Text className="text-[#374151] text-xs font-medium text-center">
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

  const totalHoursToday = useMemo(() => {
    return todaySchedules.reduce((sum, s) => {
      const ms =
        new Date(s.scheduled_end).getTime() -
        new Date(s.scheduled_start).getTime();
      return sum + ms / 3600000;
    }, 0);
  }, [todaySchedules]);

  const totalIncomeToday = useMemo(() => {
    return todaySchedules.reduce((sum, s) => {
      const val = Number(s.price);
      return sum + (Number.isNaN(val) ? 0 : val);
    }, 0);
  }, [todaySchedules]);

  const handleOpenDirections = (s: WorkerMySchedule) => {
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

  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FC]"
      showsVerticalScrollIndicator={false}
    >
      {isLoading || !profile ? (
        <View className="items-center justify-center py-24">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : !isActive ? (
        <>
          <View
            style={{ paddingTop: insets.top + 12 }}
            className="flex-row items-center justify-between px-5 pb-4 bg-white border-b border-[#F3F4F6]"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-2">
                <Feather name="briefcase" size={14} color="#2563EB" />
              </View>
              <Text className="text-[#2563EB] text-lg font-bold">
                CleanCare Staff
              </Text>
            </View>
            <Feather name="bell" size={22} color="#111827" />
          </View>
          <ProfileStatusCard profile={profile} />
        </>
      ) : (
        <>
          {/* Header chào hỏi */}
          <View
            style={{ paddingTop: insets.top + 16 }}
            className="flex-row items-center justify-between px-5 pb-5 bg-white border-b border-[#F3F4F6]"
          >
            <View className="flex-row items-center flex-1">
              {workerAvatar ? (
                <Image
                  source={{ uri: workerAvatar }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-[#EEF2FF] items-center justify-center">
                  <Feather name="user" size={20} color="#2563EB" />
                </View>
              )}
              <Text
                className="text-[#2563EB] text-lg font-extrabold ml-3"
                numberOfLines={1}
              >
                Xin chào, {workerName} 👋
              </Text>
            </View>
            <Pressable hitSlop={10}>
              <Feather name="bell" size={24} color="#111827" />
            </Pressable>
          </View>

          <View className="px-5 pt-5">
            {/* Thống kê hôm nay */}
            <View className="flex-row mb-6" style={{ gap: 10 }}>
              <View className="flex-1 bg-white rounded-2xl py-4 items-center border border-[#F3F4F6]">
                <Text className="text-[#2563EB] text-2xl font-extrabold">
                  {todaySchedules.length}
                </Text>
                <Text className="text-[#6B7280] text-xs mt-1 text-center">
                  công việc
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl py-4 items-center border border-[#F3F4F6]">
                <Text className="text-[#2563EB] text-2xl font-extrabold">
                  {formatHours(totalHoursToday)}
                </Text>
                <Text className="text-[#6B7280] text-xs mt-1 text-center">
                  giờ làm
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl py-4 items-center px-1 border border-[#F3F4F6]">
                <Text
                  className="text-[#2563EB] text-lg font-extrabold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrency(totalIncomeToday) ?? "—"}
                </Text>
                <Text className="text-[#6B7280] text-xs mt-1 text-center">
                  thu nhập dự kiến
                </Text>
              </View>
            </View>

            {/* Công việc hôm nay */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#111827] text-lg font-bold">
                Công việc hôm nay
              </Text>
              {/* TODO: đổi route cho khớp trang lịch/việc của bạn */}
              <Pressable onPress={() => router.push("/schedule")}>
                <Text className="text-[#2563EB] text-sm font-semibold">
                  Xem tất cả
                </Text>
              </Pressable>
            </View>

            {isLoadingSchedules ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#2563EB" />
              </View>
            ) : todaySchedules.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-[#F3F4F6] mb-6">
                <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-3">
                  <Feather name="coffee" size={22} color="#2563EB" />
                </View>
                <Text className="text-[#111827] font-bold text-base mb-1">
                  Hôm nay bạn chưa có việc
                </Text>
                <Text className="text-[#9CA3AF] text-sm text-center">
                  Sang tab "Công việc" để nhận thêm việc nhé
                </Text>
              </View>
            ) : (
              todaySchedules.map((s) => {
                const badge = STATUS_STYLE[s.status] ?? STATUS_STYLE.PENDING;
                const hasCoordinates =
                  !!s.address_latitude && !!s.address_longitude;

                return (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      router.push({
                        pathname: "/jobs/[id]",
                        params: { id: String(s.id), source: "mine" },
                      })
                    }
                    className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Feather name="clock" size={15} color="#374151" />
                        <Text className="text-[#111827] text-base font-bold ml-1.5">
                          {formatTime(s.scheduled_start)} -{" "}
                          {formatTime(s.scheduled_end)}
                        </Text>
                      </View>
                      <View
                        style={{ backgroundColor: badge.bg }}
                        className="px-2.5 py-1 rounded-full"
                      >
                        <Text
                          style={{ color: badge.color }}
                          className="text-xs font-bold"
                        >
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-[#111827] text-lg font-bold mb-1">
                      {s.service_name}
                    </Text>

                    <View className="flex-row items-center mb-3">
                      <Feather name="map-pin" size={14} color="#9CA3AF" />
                      <Text className="text-[#6B7280] text-sm ml-1.5">
                        {s.address_ward ? `${s.address_ward}, ` : ""}
                        {s.address_city}
                      </Text>
                    </View>

                    {hasCoordinates && (
                      <>
                        <View className="h-[1px] bg-[#F3F4F6] mb-3" />
                        <Pressable
                          onPress={() => handleOpenDirections(s)}
                          className="flex-row items-center justify-center bg-[#EEF2FF] rounded-xl py-3"
                        >
                          <Feather
                            name="navigation"
                            size={15}
                            color="#2563EB"
                          />
                          <Text className="text-[#2563EB] font-semibold text-sm ml-2">
                            Chỉ đường
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
