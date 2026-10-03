import {
  useMarkNotificationReadMutation,
  useRegisterPushTokenMutation,
} from "@/features/notification/api/notificationApi";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

const handledResponses = new Set<string>();

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function usePushNotifications(enabled: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const registeredRef = useRef(false);
  const [markRead] = useMarkNotificationReadMutation();

  useEffect(() => {
    if (!enabled || isExpoGo) return;
    let cancelled = false;
    let sub: { remove: () => void } | undefined;

    const open = (response: any) => {
      const id = response?.notification?.request?.identifier;
      if (id) {
        if (handledResponses.has(id)) return;
        handledResponses.add(id);
      }
      const data = response?.notification?.request?.content?.data;
      if (data?.notification_id) markRead(Number(data.notification_id));
      if (data?.schedule_id && data?.booking_id) {
        router.push({
          pathname: "/jobs/[id]",
          params: {
            id: String(data.schedule_id),
            source: "mine",
            bookingId: String(data.booking_id),
            view: "session",
          },
        } as any);
      } else {
        router.push("/notifications" as any);
      }
    };

    (async () => {
      const Notifications = await import("expo-notifications");
      if (cancelled) return;
      // App mở từ trạng thái tắt hẳn bằng cách bấm push
      const last = await Notifications.getLastNotificationResponseAsync();
      if (last) open(last);
      sub = Notifications.addNotificationResponseReceivedListener(open);
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);

  return { expoPushToken };
}
