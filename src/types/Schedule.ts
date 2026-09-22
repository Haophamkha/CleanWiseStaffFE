import type { FormField } from "./ServiceForm";

export type ScheduleStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type ScheduleImageType = "BEFORE" | "AFTER" | "ISSUE" | "OTHER";

export interface ScheduleImage {
  id: number;
  image: string;
  image_type: ScheduleImageType;
  note: string | null;
  created_at: string;
}

export interface WorkerSchedule {
  id: number;
  booking_id: number;
  booking_code: string;
  service_id: number;
  service_name: string;
  booking_note: string | null;
  sequence_no: number;
  total_sessions: number;
  scheduled_start: string;
  scheduled_end: string;
  status: ScheduleStatus;
  address_city: string;
  address_ward: string | null;
  // BE trả DecimalField dạng string qua JSON (DRF không tự convert sang
  // number), nên để string | null thay vì number | null.
  address_latitude: string | null;
  address_longitude: string | null;
  customer_avatar: string | null;
  customer_name: string;
  payment_status: PaymentStatus;
  // Giá của RIÊNG buổi này (booking.total_amount / total_sessions), không
  // phải tổng giá cả gói. null nếu booking chưa có total_amount.
  price: string | null;
  service_data: Record<string, any>;
  form_schema: { fields: FormField[] } | null;
  assignment_id: number | null;
}

export interface WorkerMySchedule extends WorkerSchedule {
  note: string | null;
  address_line: string;
  receiver_name: string;
  receiver_phone: string;
  can_cancel: boolean;
  cancel_deadline: string;
  images: ScheduleImage[];
}

export interface ClaimScheduleResult {
  message: string;
  data: {
    assignment_id: number;
    schedule_id: number;
    status: string;
  };
}

export interface CancelAssignmentResult {
  message: string;
  data: {
    assignment_id: number;
    schedule_id: number;
    status: string;
  };
}

export interface AvailableSchedulesParams {
  booking_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface MySchedulesParams {
  status?: ScheduleStatus;
}
