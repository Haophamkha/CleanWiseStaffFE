import {
  useMarkNotificationReadMutation,
  useRegisterPushTokenMutation,
} from "@/features/notification/api/notificationApi";
import { resolveNotificationRoute } from "@/features/notification/utils/notificationMeta";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const handledResponses = new Set<string>();

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function usePushNotifications(enabled: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const registeredRef = useRef(false);
  const [markRead] = useMarkNotificationReadMutation();

  useEffect(() => {
    if (!enabled || isExpoGo || Platform.OS === "web") return;
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
      const route = resolveNotificationRoute({
        target: data?.target,
        type: data?.type,
        bookingId: data?.booking_id,
        scheduleId: data?.schedule_id,
        source: data?.source,
        view: data?.invitation_id ? "session" : data?.view,
      });
      router.push((route ?? "/notifications") as any);
    };

    (async () => {
      const Notifications = await import("expo-notifications");
      if (cancelled) return;
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Thông báo chung",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#AE525C",
          sound: "default",
        });
      }
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
