import { baseApi } from "@/store/baseApi";

export type DisciplineSummary = {
  score: number;
  max_score: number;
  status: "ACTIVE" | "WARNING" | "RESTRICTED" | "REVIEW" | "SUSPENDED" | "BANNED";
  restricted_until: string | null;
  enforced: boolean;
  can_claim: boolean;
};

export type CancellationPreview = DisciplineSummary & {
  deduction: number;
  projected_score: number;
  restriction_hours: number;
  requires_review: boolean;
  can_cancel: boolean;
};

export type DisciplineCase = {
  id: number;
  booking: number;
  booking_code: string;
  schedule: number;
  sequence: number;
  kind_label: string;
  status: "PENDING" | "CONFIRMED" | "WAIVED";
  status_label: string;
  deduction: number;
  reason: string;
  review_note: string;
  expires_at: string;
  sanction: string;
  sanction_label: string;
  sanction_note: string;
  appeal_id: number | null;
  can_appeal: boolean;
};

type DisciplineHistory = {
  summary: DisciplineSummary;
  appeal_issue_type: number | null;
  results: DisciplineCase[];
  next: string | null;
  previous: string | null;
};

const unwrap = <T>(response: T | { data: T }): T =>
  response && typeof response === "object" && "data" in response ? response.data : response;

export const disciplineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscipline: builder.query<DisciplineHistory, number>({
      query: (page) => ({ url: "/api/worker/discipline/", method: "GET", params: { page } }),
      transformResponse: unwrap<DisciplineHistory>,
      providesTags: [{ type: "Complaints", id: "DISCIPLINE" }],
    }),
    getCancellationPreview: builder.query<CancellationPreview, number>({
      query: (assignmentId) => ({ url: `/api/worker/assignments/${assignmentId}/cancel-preview/`, method: "GET" }),
      transformResponse: unwrap<CancellationPreview>,
      providesTags: [{ type: "Complaints", id: "DISCIPLINE" }],
    }),
  }),
});

export const { useGetDisciplineQuery, useGetCancellationPreviewQuery } = disciplineApi;
