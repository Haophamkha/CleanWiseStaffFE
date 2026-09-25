import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { AvailableJobCard } from "@/components/job/AvailableJobCard";
import { DayFilterBar } from "@/components/job/DayFilterBar";
import { JobsListFooter } from "@/components/job/JobsListFooter";
import { MyJobCard } from "@/components/job/MyJobCard";
import { MyPackageCard } from "@/components/job/MyPackageCard";
import { usePagedJobs } from "@/hooks/usePagedJobs";
import {
  useGetAvailableJobsPagedQuery,
  useGetMyJobsPagedQuery,
} from "@/services/jobsApi";
import type {
  AvailableJobsPagedArgs,
  MyJobsPagedArgs,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/types/Schedule";
import type { OpenJob, Tab } from "@/types/jobNav";
import { buildDayChips, DAY_CHIP_COUNT } from "@/utils/dayChips";
import type { MyDisplayItem } from "@/utils/myScheduleGrouping";
import { groupMySchedules } from "@/utils/myScheduleGrouping";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AvailableFilters = Omit<AvailableJobsPagedArgs, "page">;
type MyFilters = Omit<MyJobsPagedArgs, "page">;

const NO_MY_FILTERS: MyFilters = {};

function JobsContent() {
  const insets = useSafeAreaInsets();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(
    initialTab === "mine" ? "mine" : "available",
  );

  const [day, setDay] = useState<string | null>(null);
  const dayChips = useMemo(() => buildDayChips(DAY_CHIP_COUNT), []);
  const availableFilters = useMemo<AvailableFilters>(
    () => (day ? { date_from: day, date_to: day } : {}),
    [day],
  );
  const dayFiltered = day !== null;

  const available = usePagedJobs<WorkerSchedule, AvailableFilters>(
    useGetAvailableJobsPagedQuery,
    availableFilters,
  );
  const mine = usePagedJobs<WorkerMySchedule, MyFilters>(
    useGetMyJobsPagedQuery,
    NO_MY_FILTERS,
  );
  const current = tab === "available" ? available : mine;

  const myDisplayItems = useMemo<MyDisplayItem[]>(
    () => groupMySchedules(mine.items),
    [mine.items],
  );

  const currentRef = useRef(current);
  currentRef.current = current;
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      currentRef.current.refresh();
    }, []),
  );

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    (next === "available" ? available : mine).refresh();
  };

  const openJob = useCallback<OpenJob>((id, source, bookingId) => {
    router.push({
      pathname: "/jobs/[id]",
      params: {
        id: String(id),
        source,
        ...(bookingId ? { bookingId: String(bookingId) } : {}),
      },
    });
  }, []);

  const userScrolledRef = useRef(false);
  const markScrolled = () => {
    userScrolledRef.current = true;
  };
  const handleEndReached = () => {
    if (!userScrolledRef.current) return;
    userScrolledRef.current = false;
    current.loadMore();
  };

  const renderItem = useCallback(
    ({ item }: { item: WorkerSchedule | MyDisplayItem }) => {
      if (tab === "available") {
        return (
          <AvailableJobCard
            item={item as WorkerSchedule}
            onOpen={openJob}
            dayFiltered={dayFiltered}
          />
        );
      }
      const entry = item as MyDisplayItem;
      return entry.type === "package" ? (
        <MyPackageCard
          bookingId={entry.bookingId}
          sessions={entry.sessions}
          onOpen={openJob}
        />
      ) : (
        <MyJobCard item={entry.item} onOpen={openJob} />
      );
    },
    [tab, openJob, dayFiltered],
  );

  const keyExtractor = useCallback(
    (item: WorkerSchedule | MyDisplayItem) => {
      if (tab === "available") return String((item as WorkerSchedule).id);
      const entry = item as MyDisplayItem;
      return entry.type === "package"
        ? `pkg-${entry.bookingId}`
        : `single-${entry.item.id}`;
    },
    [tab],
  );

  const displayData: (WorkerSchedule | MyDisplayItem)[] =
    tab === "available" ? available.items : myDisplayItems;

  const hasItems = current.items.length > 0;
  const showInitialError = current.isError && !hasItems && !current.isLoading;
  const emptyForDay = tab === "available" && dayFiltered;

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
            onPress={() => switchTab("available")}
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
            onPress={() => switchTab("mine")}
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

        {tab === "available" ? (
          <DayFilterBar chips={dayChips} selected={day} onSelect={setDay} />
        ) : null}
      </View>

      {current.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 20 + insets.bottom,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={current.isRefreshing}
              onRefresh={current.refresh}
            />
          }
          onScrollBeginDrag={markScrolled}
          onMomentumScrollBegin={markScrolled}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          // Danh sách dài: chỉ render phần gần màn hình, card đã memo.
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={
            tab === "available" && current.total > 0 ? (
              <Text className="text-[#6B7280] text-sm mb-3">
                {dayFiltered
                  ? `${current.total} đơn có buổi trống trong ngày này`
                  : `${current.total} đơn đang chờ nhận`}
              </Text>
            ) : null
          }
          ListFooterComponent={
            <JobsListFooter
              isLoadingMore={current.isLoadingMore}
              isError={current.isError}
              hasNext={current.hasNext}
              hasItems={hasItems}
              onRetry={() => current.retryMore()}
            />
          }
          ListEmptyComponent={
            showInitialError ? (
              <View className="flex-1 items-center justify-center py-24">
                <View className="w-14 h-14 rounded-full bg-[#FEE2E2] items-center justify-center mb-4">
                  <Feather name="wifi-off" size={22} color="#B91C1C" />
                </View>
                <Text className="text-[#111827] font-semibold text-base mb-1">
                  Không tải được danh sách
                </Text>
                <Pressable onPress={() => current.retryMore()} className="mt-2">
                  <Text className="text-[#2563EB] font-semibold text-sm">
                    Thử lại
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-24">
                <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-4">
                  <Feather
                    name={emptyForDay ? "calendar" : "clipboard"}
                    size={22}
                    color="#2563EB"
                  />
                </View>
                <Text className="text-[#111827] font-semibold text-base mb-1">
                  {emptyForDay
                    ? "Không có buổi nào trong ngày này"
                    : tab === "available"
                      ? "Chưa có buổi làm khả dụng"
                      : "Bạn chưa nhận buổi nào"}
                </Text>
                {emptyForDay ? (
                  <Pressable onPress={() => setDay(null)} className="mt-2">
                    <Text className="text-[#2563EB] font-semibold text-sm">
                      Xem tất cả các ngày
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="text-[#9CA3AF] text-sm">
                    Kéo xuống để làm mới
                  </Text>
                )}
              </View>
            )
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
