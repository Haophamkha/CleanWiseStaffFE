import {
  useGetAvailableJobsPagedQuery,
  useGetMyJobsPagedQuery,
} from "@/features/job/api/jobsApi";
import { usePagedJobs } from "@/features/job/hooks/usePagedJobs";
import type { OpenJob, Tab } from "@/features/job/types/jobNav";
import type {
  AvailableJobsPagedArgs,
  MyJobsPagedArgs,
  MyJobsTab,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import type { MyDisplayItem } from "@/features/schedule/utils/myScheduleGrouping";
import { groupMySchedules } from "@/features/schedule/utils/myScheduleGrouping";
import { useSingleNavigate } from "@/hooks/useSingleNavigate";
import { useAppSelector } from "@/store/hooks";
import { buildDayChips, DAY_CHIP_COUNT } from "@/utils/dayChips";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AvailableFilters = Omit<AvailableJobsPagedArgs, "page">;
type MyFilters = Omit<MyJobsPagedArgs, "page">;

export type JobsListState<T> = {
  items: T[];
  total: number;
  hasNext: boolean;
  hasItems: boolean;
  isLoading: boolean;
  isError: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  loadMore: () => void;
  refresh: () => void;
  retryMore: () => unknown;
};

export function useJobs() {
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();

  // Tab chính: available / mine
  const [tab, setTab] = useState<Tab>(initialTab ?? "available");

  // Tab con của "mine": upcoming / history...
  const [myTab, setMyTab] = useState<MyJobsTab>("upcoming");

  const myFilters = useMemo<MyFilters>(() => ({ tab: myTab }), [myTab]);

  const mine = usePagedJobs<WorkerMySchedule, MyFilters>(
    useGetMyJobsPagedQuery,
    myFilters,
  );

  const [day, setDay] = useState<string | null>(null);

  const dayChips = useMemo(() => buildDayChips(DAY_CHIP_COUNT), []);

  const availableFilters = useMemo<AvailableFilters>(
    () =>
      day
        ? {
            date_from: day,
            date_to: day,
          }
        : {},
    [day],
  );

  const dayFiltered = day !== null;

  const available = usePagedJobs<WorkerSchedule, AvailableFilters>(
    useGetAvailableJobsPagedQuery,
    availableFilters,
  );

  const current = tab === "available" ? available : mine;

  const myDisplayItems = useMemo<MyDisplayItem[]>(
    () => groupMySchedules(mine.items),
    [mine.items],
  );

  // Giữ reference mới nhất của list đang active
  const currentRef = useRef(current);
  currentRef.current = current;

  // Refresh khi màn hình được focus lại
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

  // Refresh khi notification thay đổi
  const refreshTick = useAppSelector((s) => s.notification.refreshTick);

  const lastTick = useRef(refreshTick);

  useEffect(() => {
    if (lastTick.current === refreshTick) return;

    lastTick.current = refreshTick;
    currentRef.current.refresh();
  }, [refreshTick]);

  const switchTab = useCallback(
    (next: Tab) => {
      if (next === tab) return;

      setTab(next);

      const nextList = next === "available" ? available : mine;

      nextList.refresh();
    },
    [tab, available, mine],
  );

  const navigateOnce = useSingleNavigate();

  const openJob = useCallback<OpenJob>(
    (id, source, bookingId) => {
      navigateOnce(() =>
        router.push({
          pathname: "/jobs/[id]",
          params: {
            id: String(id),
            source,
            ...(bookingId
              ? {
                  bookingId: String(bookingId),
                }
              : {}),
          },
        }),
      );
    },
    [navigateOnce],
  );

  // Chỉ cho phép load more sau khi user thật sự scroll
  const userScrolledRef = useRef(false);

  const markScrolled = useCallback(() => {
    userScrolledRef.current = true;
  }, []);

  const onEndReached = useCallback(() => {
    if (!userScrolledRef.current) return;

    userScrolledRef.current = false;
    current.loadMore();
  }, [current]);

  const availableState: JobsListState<WorkerSchedule> = {
    ...available,
    hasItems: available.items.length > 0,
  };

  const mineState: JobsListState<MyDisplayItem> = {
    ...mine,
    items: myDisplayItems,
    hasItems: myDisplayItems.length > 0,
  };

  return {
    myTab,
    setMyTab,

    tab,
    switchTab,

    day,
    setDay,
    dayChips,
    dayFiltered,

    available: availableState,
    mine: mineState,

    openJob,

    markScrolled,
    onEndReached,
  };
}
