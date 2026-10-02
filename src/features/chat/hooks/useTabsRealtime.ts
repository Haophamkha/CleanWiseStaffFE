import { useGetConversationsQuery } from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { notificationApi } from "@/features/notification/api/notificationApi";
import {
    bumpRefreshTick,
    setUnreadCount,
} from "@/features/notification/stores/notificationSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useTabsRealtime() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: conversations, refetch } = useGetConversationsQuery(1, {
    skip: !user,
    refetchOnMountOrArgChange: 15,
  });

  const dispatch = useAppDispatch();

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
        dispatch(bumpRefreshTick());
        dispatch(
          baseApi.util.invalidateTags([
            "Notifications",
            "MySchedules",
            "AvailableSchedules",
            "Profile",
          ]),
        );
      }
    },
    () => {
      refetch();
      dispatch(bumpRefreshTick());
      dispatch(
        notificationApi.endpoints.getUnreadCount.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      dispatch(baseApi.util.invalidateTags(["MySchedules", "Profile"]));
    },
  );

  const unreadCount = user ? (conversations?.total_unread ?? 0) : 0;
  const unreadLabel: string | undefined =
    unreadCount > 0
      ? unreadCount > 99
        ? "99+"
        : String(unreadCount)
      : undefined;

  return { unreadCount, unreadLabel };
}
