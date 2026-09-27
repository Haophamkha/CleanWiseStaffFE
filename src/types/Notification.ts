export type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "ASSIGNMENT"
  | "COMPLAINT"
  | "SYSTEM";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  type_display: string;
  related_booking: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  is_read?: boolean;
  type?: NotificationType;
  page?: number;
  page_size?: number;
}

export interface NotificationListData {
  results: AppNotification[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  unread_count: number;
}

export interface NotificationListResponse {
  message: string;
  data: NotificationListData;
}

export interface UnreadCountResponse {
  message: string;
  data: { unread_count: number };
}
