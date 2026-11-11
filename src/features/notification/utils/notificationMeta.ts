import { translate as defaultTranslate } from "@/features/language/i18n";
import type { Href } from "expo-router";
type RouteInput = {
  target?: string | null;
  type?: string | null;
  bookingId?: number | string | null;
  scheduleId?: number | string | null;
  source?: string | null;
  view?: string | null;
};

/**
 * Xác định route điều hướng khi nhấn vào thông báo.
 * Dùng chung cho các màn hình thông báo trong ứng dụng.
 */
export function resolveNotificationRoute(i: RouteInput): Href | null {
  if (i.target === "wallet") {
    return "/earnings";
  }

  if (i.target === "none") {
    return null;
  }

  if (i.target === "discipline") {
    return { pathname: "/complaints", params: { tab: "discipline" } };
  }

  if (i.scheduleId && i.bookingId) {
    const available = i.source === "available";

    return {
      pathname: "/jobs/[id]",
      params: {
        id: String(i.scheduleId),
        bookingId: String(i.bookingId),
        source: available ? "available" : "mine",
        ...(available && i.view !== "session" ? {} : { view: "session" }),
      },
    };
  }

  if (i.source === "available") {
    return { pathname: "/(tabs)/jobs", params: { tab: "available" } };
  }

  if (i.type === "SYSTEM") {
    return "/(tabs)/profile";
  }

  if (i.bookingId) {
    return {
      pathname: "/(tabs)/jobs",
      params: { tab: "mine" },
    };
  }

  return null;
}

export type NotificationIconLibrary = "feather" | "material-community";

interface NotificationTypeMeta {
  label: string;
  iconLibrary: NotificationIconLibrary;
  iconName: string;
}

function getLocalizedNotificationTypeMap(translateText = defaultTranslate): Record<string, NotificationTypeMeta> {
  return {
    BOOKING: {
      label: translateText("Đơn hàng"),
      iconLibrary: "material-community",
      iconName: "broom",
    },
    PAYMENT: {
      label: translateText("Thanh toán"),
      iconLibrary: "feather",
      iconName: "check-circle",
    },
    ASSIGNMENT: {
      label: translateText("Phân công"),
      iconLibrary: "feather",
      iconName: "user-check",
    },
    COMPLAINT: {
      label: translateText("Khiếu nại"),
      iconLibrary: "feather",
      iconName: "alert-circle",
    },
    SYSTEM: {
      label: translateText("Hệ thống"),
      iconLibrary: "feather",
      iconName: "bell",
    },
  };
}

export function getNotificationTypeMeta(type: string, translateText = defaultTranslate): NotificationTypeMeta {
  return getLocalizedNotificationTypeMap(translateText)[type] ?? getLocalizedNotificationTypeMap(translateText).SYSTEM;
}
