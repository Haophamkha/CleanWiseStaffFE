export type NotificationIconLibrary = "feather" | "material-community";

interface NotificationTypeMeta {
  label: string;
  iconLibrary: NotificationIconLibrary;
  iconName: string;
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeMeta> = {
  BOOKING: {
    label: "Đơn hàng",
    iconLibrary: "material-community",
    iconName: "broom",
  },
  PAYMENT: {
    label: "Thanh toán",
    iconLibrary: "feather",
    iconName: "check-circle",
  },
  ASSIGNMENT: {
    label: "Phân công",
    iconLibrary: "feather",
    iconName: "user-check",
  },
  COMPLAINT: {
    label: "Khiếu nại",
    iconLibrary: "feather",
    iconName: "alert-circle",
  },
  SYSTEM: { label: "Hệ thống", iconLibrary: "feather", iconName: "bell" },
};

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_MAP[type] ?? NOTIFICATION_TYPE_MAP.SYSTEM;
}
