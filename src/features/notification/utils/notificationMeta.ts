import { translate as tr } from "@/features/language/i18n";
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
export function resolveNotificationRoute(i: RouteInput): any | null {
  if (i.target === "wallet") {
    return "/earnings";
  }

  if (i.target === "none") {
    return null;
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

function getLocalizedNotificationTypeMap(): Record<string, NotificationTypeMeta> {
  return {
    BOOKING: {
      label: tr("Đơn hàng"),
      iconLibrary: "material-community",
      iconName: "broom",
    },
    PAYMENT: {
      label: tr("Thanh toán"),
      iconLibrary: "feather",
      iconName: "check-circle",
    },
    ASSIGNMENT: {
      label: tr("Phân công"),
      iconLibrary: "feather",
      iconName: "user-check",
    },
    COMPLAINT: {
      label: tr("Khiếu nại"),
      iconLibrary: "feather",
      iconName: "alert-circle",
    },
    SYSTEM: {
      label: tr("Hệ thống"),
      iconLibrary: "feather",
      iconName: "bell",
    },
  };
}

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return getLocalizedNotificationTypeMap()[type] ?? getLocalizedNotificationTypeMap().SYSTEM;
}
