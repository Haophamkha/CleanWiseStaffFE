import { useGetConversationsQuery } from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useGetUnreadCountQuery } from "@/features/notification/api/notificationApi";
import {
    bumpRefreshTick,
    setUnreadCount,
} from "@/features/notification/stores/notificationSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showInfoToast } from "@/utils/toast";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export function useStaffRealtime() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { refetch } = useGetConversationsQuery(1, {
    skip: !user,
    refetchOnMountOrArgChange: 15,
  });

  const dispatch = useAppDispatch();
  useGetUnreadCountQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 15000,
    skipPollingIfUnfocused: true,
  });

  const refreshNotificationData = () => {
    dispatch(bumpRefreshTick());
    dispatch(
      baseApi.util.invalidateTags([
        "Notifications",
        "MySchedules",
        "AvailableSchedules",
        "Profile",
        { type: "Complaints", id: "DISCIPLINE" },
        { type: "Complaints", id: "STATEMENTS" },
      ]),
    );
  };

  useChatSocket(
    !!user,
    (event) => {
      if (
        event.type === "message.created" ||
        event.type === "messages.read" ||
        event.type === "conversation.updated"
      ) {
        refetch();
      } else if (event.type === "notification.unread") {
        if (typeof event.unread_count === "number") {
          dispatch(setUnreadCount(event.unread_count));
        }
        refreshNotificationData();
        if (event.notification?.target === "worker_statement") {
          showInfoToast(
            t("Có khiếu nại cần giải trình"),
            t("Mở mục Giải trình để phản hồi trước hạn."),
            () => router.push({ pathname: "/complaints", params: { tab: "statements" } }),
          );
        }
      }
    },
    () => {
      refetch();
      refreshNotificationData();
    },
  );
}
