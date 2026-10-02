import {
  useGetAvailableJobsPagedQuery,
  useGetMyJobsPagedQuery,
} from "@/features/job/api/jobsApi";
import { usePagedJobs } from "@/features/job/hooks/usePagedJobs";
import type { OpenJob, Tab } from "@/features/job/types/jobNav";
import type {
  AvailableJobsPagedArgs,
  MyJobsPagedArgs,
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

const NO_MY_FILTERS: MyFilters = {};

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

  const refreshTick = useAppSelector((s) => s.notification.refreshTick);
  const lastTick = useRef(refreshTick);
  useEffect(() => {
    if (lastTick.current === refreshTick) return;
    lastTick.current = refreshTick;
    currentRef.current.refresh();
  }, [refreshTick]);

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    (next === "available" ? available : mine).refresh();
  };

  const navigateOnce = useSingleNavigate();

  const openJob = useCallback<OpenJob>(
    (id, source, bookingId) => {
      navigateOnce(() =>
        router.push({
          pathname: "/jobs/[id]",
          params: {
            id: String(id),
            source,
            ...(bookingId ? { bookingId: String(bookingId) } : {}),
          },
        }),
      );
    },
    [navigateOnce],
  );

  const userScrolledRef = useRef(false);
  const markScrolled = () => {
    userScrolledRef.current = true;
  };
  const onEndReached = () => {
    if (!userScrolledRef.current) return;
    userScrolledRef.current = false;
    current.loadMore();
  };

  const availableState: JobsListState<WorkerSchedule> = {
    ...available,
    hasItems: available.items.length > 0,
  };
  const mineState: JobsListState<MyDisplayItem> = {
    ...mine,
    items: myDisplayItems,
    hasItems: mine.items.length > 0,
  };

  return {
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
