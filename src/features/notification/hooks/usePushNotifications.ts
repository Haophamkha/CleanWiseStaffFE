import { useTranslation } from "react-i18next";

import { STORAGE_KEYS } from "@/config/constants";
import {
  useMarkNotificationReadMutation,
  useRegisterPushTokenMutation,
} from "@/features/notification/api/notificationApi";
import { resolveNotificationRoute } from "@/features/notification/utils/notificationMeta";
import { storage } from "@/utils/storage";
import { isRunningInExpoGo, requireOptionalNativeModule } from "expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import type { NotificationResponse } from "expo-notifications";

const handledResponses = new Set<string>();

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function usePushNotifications(enabled: boolean) {
  const { t: tr } = useTranslation();

  const [registerToken] = useRegisterPushTokenMutation();
  const registeredRef = useRef(false);
  const [markRead] = useMarkNotificationReadMutation();

  useEffect(() => {
    if (!enabled) {
      registeredRef.current = false;
      return;
    }
    if (isExpoGo || isRunningInExpoGo() || (Platform.OS !== "android" && Platform.OS !== "ios")) return;
    // expo-notifications imports ExpoApplication before setup can run.
    if (!requireOptionalNativeModule("ExpoApplication")) return;
    const platform = Platform.OS;
    let cancelled = false;
    let sub: { remove: () => void } | undefined;
    let appState: { remove: () => void } | undefined;

    const open = (response: NotificationResponse) => {
      const { identifier, content } = response.notification.request;
      if (cancelled || handledResponses.has(identifier)) return;
      handledResponses.add(identifier);
      const data = content.data ?? {};
      const notificationId = Number(data.notification_id);
      if (notificationId > 0) markRead(notificationId);
      const route = resolveNotificationRoute({
        target: typeof data.target === "string" ? data.target : undefined,
        type: typeof data.type === "string" ? data.type : undefined,
        bookingId: Number(data.booking_id),
        scheduleId: Number(data.schedule_id),
        source: typeof data.source === "string" ? data.source : undefined,
        view: data.invitation_id || data.view === "session" ? "session" : undefined,
      });
      router.push(route ?? "/notifications");
    };

    const setup = async () => {
      const Notifications = await import("expo-notifications");
      if (cancelled) return;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      const openAndClear = (response: NotificationResponse) => {
        open(response);
        Notifications.clearLastNotificationResponseAsync().catch(() => {});
      };
      sub = Notifications.addNotificationResponseReceivedListener(openAndClear);
      const last = await Notifications.getLastNotificationResponseAsync();
      if (cancelled) return;
      if (last) openAndClear(last);
      if (platform === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: tr("Thông báo chung"),
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#AE525C",
          sound: "default",
        });
      }
      if (cancelled) return;

      let registering = false;
      const register = async (askPermission: boolean) => {
        if (cancelled || registeredRef.current || registering) return;
        registering = true;
        try {
          let permission = await Notifications.getPermissionsAsync();
          if (cancelled) return;
          if (!permission.granted && permission.canAskAgain && askPermission) {
            permission = await Notifications.requestPermissionsAsync();
          }
          if (cancelled || !permission.granted) return;
          const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
          const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
          if (cancelled) return;
          await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
          if (cancelled) return;
          await registerToken({ token, platform }).unwrap();
          if (!cancelled) registeredRef.current = true;
        } catch {
          // Retry when the app returns to the foreground.
        } finally {
          registering = false;
        }
      };
      appState = AppState.addEventListener("change", (state) => {
        if (state === "active") void register(false);
      });
      void register(true);
    };
    setup().catch(() => {});

    return () => {
      cancelled = true;
      sub?.remove();
      appState?.remove();
    };
  }, [enabled, markRead, registerToken, tr]);
}
