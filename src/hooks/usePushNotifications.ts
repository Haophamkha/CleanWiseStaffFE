import { STORAGE_KEYS } from "@/config/constants";
import { useRegisterPushTokenMutation } from "@/services/notificationApi";
import { storage } from "@/utils/storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function usePushNotifications(enabled: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      registeredRef.current = false;
      return;
    }
    if (registeredRef.current || isExpoGo) return;

    const register = async () => {
      try {
        const Device = await import("expo-device");
        const Notifications = await import("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (!Device.isDevice) return;

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = tokenResponse.data;
        setExpoPushToken(token);
        await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
        registeredRef.current = true;

        registerToken({ token, platform: Platform.OS });

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.log(
            "[usePushNotifications] Bỏ qua lỗi lấy push token:",
            error,
          );
        }
      }
    };

    register();
  }, [enabled]);

  return { expoPushToken };
}
