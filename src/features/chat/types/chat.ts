export type ChatAssignment = {
  assignment_id: number;
  assignment_status: string;
  schedule_id: number;
  schedule_status: string;
  scheduled_start: string;
  scheduled_end: string;
  booking_id: number;
  booking_code: string;
  booking_status: string;
  service_name: string;
};

export type ChatConversation = {
  id: number;
  customer_id: number;
  worker_id: number;
  status: "ACTIVE" | "CLOSED";
  created_at: string;
  updated_at: string;
  other_user: { id: number; name: string; avatar: string | null; role: string };
  last_message: string | null;
  last_message_at: string | null;
  latest_assignment: ChatAssignment | null;
  unread_count: number;
  can_send: boolean;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  recipient_id: number | null;
  related_assignment_id: number | null;
  message: string;
  message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  attachment: string | null;
  is_read: boolean;
  created_at: string;
};

export type ConversationPage = {
  results: ChatConversation[];
  count: number;
  total_unread: number;
  next: string | null;
  previous: string | null;
};

export type MessagePage = {
  results: ChatMessage[];
  next_cursor: number | null;
};
