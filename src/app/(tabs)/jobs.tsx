import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import {
  useGetAvailableSchedulesQuery,
  useGetMySchedulesQuery,
} from "@/services/jobsApi";
import type { WorkerMySchedule, WorkerSchedule } from "@/types/Schedule";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "available" | "mine";

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Chờ thực hiện", color: "#B45309", bg: "#FEF3C7" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "#1D4ED8", bg: "#DBEAFE" },
  COMPLETED: { label: "Hoàn thành", color: "#15803D", bg: "#DCFCE7" },
  CANCELLED: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  MISSED: { label: "Đã bỏ lỡ", color: "#B91C1C", bg: "#FEE2E2" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string, endIso: string) {
  const totalMin = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
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

function JobCard({
  item,
  tab,
  onPress,
}: {
  item: WorkerSchedule | WorkerMySchedule;
  tab: Tab;
  onPress: () => void;
}) {
  const badge = STATUS_LABEL[item.status] ?? STATUS_LABEL.PENDING;
  const price = formatCurrency(item.price);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-[#F3F4F6]">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[#9CA3AF] text-xs">
          {item.booking_code} · Buổi {item.sequence_no}/{item.total_sessions}
        </Text>
        <View
          style={{ backgroundColor: badge.bg }}
          className="px-2 py-1 rounded-full"
        >
          <Text style={{ color: badge.color }} className="text-xs font-medium">
            {badge.label}
          </Text>
        </View>
      </View>

      <Text
        className="text-[#111827] font-bold text-base mb-2"
        numberOfLines={1}
      >
        {item.service_name}
      </Text>

      <View className="flex-row items-center mb-1">
        <Feather name="calendar" size={13} color="#9CA3AF" />
        <Text className="text-[#6B7280] text-sm ml-1.5">
          {formatDateTime(item.scheduled_start)} -{" "}
          {formatDateTime(item.scheduled_end)} (
          {formatDuration(item.scheduled_start, item.scheduled_end)})
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Feather name="map-pin" size={13} color="#9CA3AF" />
        <Text className="text-[#6B7280] text-sm ml-1.5">
          {item.address_ward ? `${item.address_ward}, ` : ""}
          {item.address_city}
        </Text>
      </View>

      <View className="h-[1px] bg-[#F3F4F6] mb-3" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[#9CA3AF] text-xs mb-0.5">Thu nhập</Text>
          <Text className="text-[#111827] font-bold text-lg">
            {price ?? "—"}
          </Text>
        </View>
        <Pressable
          onPress={onPress}
          className={
            tab === "available"
              ? "bg-[#2563EB] rounded-xl px-5 py-2.5"
              : "border border-[#2563EB] rounded-xl px-5 py-2.5"
          }
        >
          <Text
            className={
              tab === "available"
                ? "text-white font-semibold text-sm"
                : "text-[#2563EB] font-semibold text-sm"
            }
          >
            {tab === "available" ? "Nhận việc" : "Chi tiết"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function JobsContent() {
  const insets = useSafeAreaInsets();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(
    initialTab === "mine" ? "mine" : "available",
  );

  const available = useGetAvailableSchedulesQuery(undefined, {
    skip: tab !== "available",
  });
  const mine = useGetMySchedulesQuery(undefined, { skip: tab !== "mine" });

  const query = tab === "available" ? available : mine;
  const data = (query.data ?? []) as (WorkerSchedule | WorkerMySchedule)[];

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="px-5 pb-4 bg-white border-b border-[#F3F4F6]"
      >
        <View className="flex-row items-center justify-between mb-4">
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

        <View className="flex-row bg-[#F3F4F6] rounded-xl p-1">
          <Pressable
            onPress={() => setTab("available")}
            className={`flex-1 py-2 rounded-lg items-center ${
              tab === "available" ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === "available" ? "text-[#2563EB]" : "text-[#6B7280]"
              }`}
            >
              Khả dụng
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("mine")}
            className={`flex-1 py-2 rounded-lg items-center ${
              tab === "mine" ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === "mine" ? "text-[#2563EB]" : "text-[#6B7280]"
              }`}
            >
              Của tôi
            </Text>
          </Pressable>
        </View>
      </View>

      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching}
              onRefresh={query.refetch}
            />
          }
          renderItem={({ item }) => (
            <JobCard
              item={item}
              tab={tab}
              onPress={() =>
                router.push({
                  pathname: "/jobs/[id]",
                  params: { id: String(item.id), source: tab },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-4">
                <Feather name="clipboard" size={22} color="#2563EB" />
              </View>
              <Text className="text-[#111827] font-semibold text-base mb-1">
                {tab === "available"
                  ? "Chưa có buổi làm khả dụng"
                  : "Bạn chưa nhận buổi nào"}
              </Text>
              <Text className="text-[#9CA3AF] text-sm">
                Kéo xuống để làm mới
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default function JobsScreen() {
  return (
    <ActiveProfileGate>
      <JobsContent />
    </ActiveProfileGate>
  );
}
