import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { baseApi, UPLOAD_TIMEOUT_MS } from "@/store/baseApi";

export type ComplaintIssueType = {
  id: number;
  code: string;
  name: string;
  description: string;
  stage: string;
  stage_label: string;
  applies_to: string;
};

export type ComplaintStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED";

export type ComplaintListItem = {
  id: number;
  booking: number;
  booking_code?: string;
  schedule?: number | null;
  schedule_sequence_no?: number | null;
  issue_type_name: string;
  stage_label: string;
  status: ComplaintStatus;
  status_label: string;
  created_at: string;
};

export type ComplaintAttachment = { id: number; file: string };

export type ComplaintDetail = ComplaintListItem & {
  content: string;
  resolution_note: string | null;
  resolved_at: string | null;
  outcome: "" | "REFUND_CUSTOMER" | "PAY_WORKER";
  my_amount: string | null; // + đã cộng / - đã trừ vào ví của chính bạn
  attachments: ComplaintAttachment[];
};

export type CreateComplaintArgs = {
  bookingId: number;
  scheduleId: number;
  issueTypeId: number;
  content?: string;
  images: PickedFile[];
};

const unwrapList = <T>(r: any): T[] => {
  const d = r?.data ?? r;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

export const complaintApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplaintIssueTypes: builder.query<ComplaintIssueType[], void>({
      query: () => ({
        url: "/api/worker/complaint-issue-types/",
        method: "GET",
      }),
      transformResponse: (r: any) => unwrapList<ComplaintIssueType>(r),
    }),

    getMyComplaints: builder.query<
      ComplaintListItem[],
      { schedule?: number } | void
    >({
      query: (params) => ({
        url: "/api/worker/complaints/",
        method: "GET",
        params: params ? { ...params } : undefined,
      }),
      transformResponse: (r: any) => unwrapList<ComplaintListItem>(r),
      providesTags: (result) => [
        { type: "Complaints" as const, id: "LIST" },
        ...(result ?? []).map((c) => ({
          type: "Complaints" as const,
          id: c.id,
        })),
      ],
    }),

    getComplaintDetail: builder.query<ComplaintDetail, number>({
      query: (id) => ({
        url: `/api/worker/complaints/${id}/`,
        method: "GET",
      }),
      transformResponse: (r: any) => r?.data ?? r,
      providesTags: (_r, _e, id) => [{ type: "Complaints", id }],
    }),

    createComplaint: builder.mutation<unknown, CreateComplaintArgs>({
      query: ({ bookingId, scheduleId, issueTypeId, content, images }) => {
        const formData = new FormData();
        formData.append("booking", String(bookingId));
        formData.append("schedule", String(scheduleId));
        formData.append("issue_type", String(issueTypeId));
        if (content?.trim()) formData.append("content", content.trim());
        images.forEach((img) =>
          formData.append("attachments", {
            uri: img.uri,
            name: img.name,
            type: img.type,
          } as any),
        );
        return {
          url: "/api/worker/complaints/",
          method: "POST",
          data: formData,
          timeout: UPLOAD_TIMEOUT_MS,
        };
      },
      invalidatesTags: [{ type: "Complaints", id: "LIST" }],
    }),

    cancelComplaint: builder.mutation<unknown, number>({
      query: (id) => ({
        url: `/api/worker/complaints/${id}/cancel/`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Complaints", id },
        { type: "Complaints", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetComplaintIssueTypesQuery,
  useGetMyComplaintsQuery,
  useGetComplaintDetailQuery,
  useCreateComplaintMutation,
  useCancelComplaintMutation,
} = complaintApi;
