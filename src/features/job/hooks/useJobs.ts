import {
  useGetAvailableJobsPagedQuery,
  useGetMyJobCountsQuery,
  useGetMyJobsPagedQuery,
} from "@/features/job/api/jobsApi";
import { useAvailableJobCount } from "@/features/job/hooks/useAvailableJobCount";
import { usePagedJobs } from "@/features/job/hooks/usePagedJobs";
import type { OpenJob, Tab } from "@/features/job/types/jobNav";
import type {
  AvailableJobsPagedArgs,
  AvailableSort,
  MyJobsPagedArgs,
  MyJobsTab,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import type { MyDisplayItem } from "@/features/schedule/utils/myScheduleGrouping";
import { groupMySchedules } from "@/features/schedule/utils/myScheduleGrouping";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";
import { useSingleNavigate } from "@/hooks/useSingleNavigate";
import { useAppSelector } from "@/store/hooks";
import { buildDayChips, DAY_CHIP_COUNT } from "@/utils/dayChips";
import { showWarningToast } from "@/utils/toast";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type AvailableFilters = Omit<AvailableJobsPagedArgs, "page">;
type MyFilters = Omit<MyJobsPagedArgs, "page">;

async function readLocation(requestPermission: boolean): Promise<GeoPoint | null> {
  const permission = await (requestPermission
    ? Location.requestForegroundPermissionsAsync()
    : Location.getForegroundPermissionsAsync());
  if (!permission.granted) return null;

  const position =
    (await Location.getLastKnownPositionAsync({ maxAge: 120000 }).catch(() => null)) ??
    (await Location.getCurrentPositionAsync({
      accuracy: requestPermission ? Location.Accuracy.High : Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: requestPermission,
    }));
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

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
  const { t: tr } = useTranslation();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();

  // Tab chính: available / mine
  const [tab, setTab] = useState<Tab>(initialTab ?? "available");

  // Tab con của "mine": today / upcoming / completed / cancelled...
  const [myTab, setMyTab] = useState<MyJobsTab>("today");

  // Hoàn thành / Đã hủy chỉ tải 5 đơn mỗi trang
  const myFilters = useMemo<MyFilters>(
    () =>
      myTab === "completed" || myTab === "cancelled"
        ? { tab: myTab, page_size: 5 }
        : { tab: myTab },
    [myTab],
  );

  const mine = usePagedJobs<WorkerMySchedule, MyFilters>(
    useGetMyJobsPagedQuery,
    myFilters,
  );

  // Số lượng đơn của từng tab con
  const { data: myCounts, refetch: refetchMyCounts } = useGetMyJobCountsQuery();
  const refetchMyCountsRef = useRef(refetchMyCounts);
  refetchMyCountsRef.current = refetchMyCounts;

  const [day, setDay] = useState<string | null>(null);
  const availableCount = useAvailableJobCount();

  const dayChips = useMemo(() => buildDayChips(DAY_CHIP_COUNT, tr), [tr]);

  const [sort, setSort] = useState<AvailableSort>("time");
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const sortRequest = useRef(0);
  const locationRequest = useRef(0);

  useFocusEffect(
    useCallback(() => {
      setIsLocating(false);
      const request = ++locationRequest.current;
      const applyLocation = (position: GeoPoint | null) => {
        if (request === locationRequest.current) {
          setLocation(position);
          if (!position) setSort((previous) => previous === "distance" ? "time" : previous);
        }
      };
      void readLocation(false).catch(() => null).then(applyLocation);
      return () => {
        locationRequest.current++;
        sortRequest.current++;
      };
    }, []),
  );

  const requestLocation = useCallback(async () => {
    const lookup = ++locationRequest.current;
    setIsLocating(true);
    const position = await readLocation(true).catch(() => null);
    if (lookup !== locationRequest.current) return undefined;
    setLocation(position);
    setIsLocating(false);
    return position;
  }, []);

  const enableDistance = useCallback(async () => {
    if (await requestLocation() === null) {
      showWarningToast(tr("Không xác định được vị trí"), tr("Hãy bật vị trí và cấp quyền cho ứng dụng."));
    }
  }, [requestLocation, tr]);

  const selectSort = useCallback(async (next: AvailableSort) => {
    const request = ++sortRequest.current;
    if (next === "distance") {
      const position = await requestLocation();
      if (position === undefined || request !== sortRequest.current) return;
      if (!position) {
        setSort("time");
        showWarningToast(tr("Không lấy được vị trí. Danh sách đang xếp theo thời gian."));
        return;
      }
    }
    setSort(next);
  }, [requestLocation, tr]);

  const availableFilters = useMemo<AvailableFilters>(
    () => ({
      ...(day ? { date_from: day, date_to: day } : {}),
      ...(sort !== "time" ? { sort } : {}),
      ...(sort === "distance" && location
        ? {
            lat: Number(location.latitude.toFixed(3)),
            lng: Number(location.longitude.toFixed(3)),
          }
        : {}),
    }),
    [day, sort, location],
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
      refetchMyCountsRef.current();
    }, []),
  );

  // Refresh khi notification thay đổi
  const refreshTick = useAppSelector((s) => s.notification.refreshTick);

  const lastTick = useRef(refreshTick);
  const lastCount = useRef(availableCount);

  useEffect(() => {
    const notificationChanged = lastTick.current !== refreshTick;
    const countChanged =
      lastCount.current !== undefined &&
      availableCount !== undefined &&
      lastCount.current !== availableCount;
    lastTick.current = refreshTick;
    lastCount.current = availableCount;

    if (notificationChanged || (tab === "available" && countChanged)) {
      currentRef.current.refresh();
    }
    if (notificationChanged) refetchMyCountsRef.current();
  }, [availableCount, refreshTick, tab]);

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
    myCounts,

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

    sort,
    selectSort,
    location,
    isLocating,
    enableDistance,
  };
}
