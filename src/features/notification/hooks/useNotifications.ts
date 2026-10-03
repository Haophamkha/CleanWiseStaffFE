import {
  useClearAllNotificationsMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notification/api/notificationApi";
import type { AppNotification } from "@/features/notification/types/Notification";
import { useAppSelector } from "@/store/hooks";
import { startOfDay } from "@/utils/format";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

const mergeById = (prev: AppNotification[], next: AppNotification[]) => {
  const map = new Map(prev.map((n) => [n.id, n]));
  next.forEach((n) => map.set(n.id, n));
  return Array.from(map.values()).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
};

export type NotificationRow =
  | { type: "header"; key: string; label: string }
  | { type: "item"; key: string; notification: AppNotification };

function dayGroupLabel(iso: string) {
  const diff = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000,
  );
  if (diff <= 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  return "Trước đó";
}

function buildRows(items: AppNotification[]): NotificationRow[] {
  const rows: NotificationRow[] = [];
  let lastLabel = "";
  items.forEach((n) => {
    const label = dayGroupLabel(n.created_at);
    if (label !== lastLabel) {
      rows.push({ type: "header", key: `h-${label}`, label });
      lastLabel = label;
    }
    rows.push({ type: "item", key: `n-${n.id}`, notification: n });
  });
  return rows;
}

export function useNotifications() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AppNotification[]>([]);
  const unreadCount = useAppSelector((s) => s.notification.unreadCount);

  // currentData: chỉ có dữ liệu của đúng `page` hiện tại (data thì giữ trang cũ)
  const { currentData, isFetching, isLoading, refetch } =
    useGetNotificationsQuery({ page, page_size: 20 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  useEffect(() => {
    if (!currentData) return;
    setItems((prev) =>
      page === 1 ? currentData.results : mergeById(prev, currentData.results),
    );
  }, [currentData, page]);

  const rows = useMemo(() => buildRows(items), [items]);

  const handleLoadMore = () => {
    if (currentData?.has_next && !isFetching) setPage((p) => p + 1);
  };

  const handleRefresh = () => {
    if (page === 1) refetch();
    else setPage(1);
  };

  const handlePressNotification = (n: AppNotification) => {
    if (!n.is_read) {
      markRead(n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      );
    }
    if (n.related_schedule && n.related_booking) {
      router.push({
        pathname: "/jobs/[id]",
        params: {
          id: String(n.related_schedule),
          source: "mine",
          bookingId: String(n.related_booking),
          view: "session",
        },
      });
    } else if (n.type === "SYSTEM") {
      router.push("/(tabs)/profile" as any);
    } else if (n.related_booking) {
      router.push({ pathname: "/(tabs)/jobs", params: { tab: "mine" } });
    }
    if (n.type === "SYSTEM") {
      router.push("/(tabs)/profile" as any);
    } else if (n.related_booking) {
      router.push({ pathname: "/(tabs)/jobs", params: { tab: "mine" } });
    }
  };

  const handleMarkAllRead = () => {
    if (!unreadCount) return;
    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      "Đánh dấu toàn bộ thông báo là đã đọc?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            markAllRead();
            setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (!items.length) return;
    Alert.alert("Xoá tất cả thông báo", "Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAll().unwrap();
            setItems([]);
            setPage(1);
          } catch {
            Alert.alert("Lỗi", "Không thể xoá thông báo. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleBack = () => router.back();

  return {
    rows,
    hasItems: items.length > 0,
    unreadCount,
    isLoading,
    isLoadingMore: isFetching && page > 1,
    handleLoadMore,
    handleRefresh,
    handlePressNotification,
    handleMarkAllRead,
    handleClearAll,
    handleBack,
  };
}
