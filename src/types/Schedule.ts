import type { FormField } from "./ServiceForm";

export type ScheduleStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type ScheduleImageType = "BEFORE" | "AFTER" | "ISSUE" | "OTHER";

export type ScheduleClaimState = "OPEN" | "MINE" | "TAKEN" | "CONFLICT";

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
  address_latitude: string | null;
  address_longitude: string | null;
  customer_avatar: string | null;
  customer_name: string;
  payment_status: PaymentStatus;
  price: string | null;
  service_data: Record<string, any>;
  form_schema?: {
    fields: FormField[];
    task_checklist?: string;
  };
  assignment_id: number | null;
  claim_state?: ScheduleClaimState;
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

export interface MySchedulesParams {
  status?: ScheduleStatus;
  booking_id?: number;
}

export interface SchedulePackageGroup {
  booking_id: number;
  booking_code: string;
  service_name: string;
  address_city: string;
  address_ward: string | null;
  payment_status: PaymentStatus;
  total_sessions: number;
  completed_sessions: number;
  claimable_or_mine_sessions: number;
  price_per_session: string | null;
  earliest_start: string;
  schedules: (WorkerSchedule | WorkerMySchedule)[];
}

export interface ClaimBookingPackageResult {
  message: string;
  data: {
    claimed: { assignment_id: number; schedule_id: number }[];
    skipped: { schedule_id: number; reason: string }[];
  };
}

export type Paginated<T> = {
  results: T[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
};

export type AvailableJobsPagedArgs = {
  page: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
};

export type MyJobsPagedArgs = {
  page: number;
  page_size?: number;
  status?: string;
};
