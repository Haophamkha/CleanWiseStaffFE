import { baseApi } from "@/store/baseApi";
import type {
  AvailableSchedulesParams,
  CancelAssignmentResult,
  ClaimScheduleResult,
  MySchedulesParams,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/types/Schedule";

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/worker/schedules/available/
    getAvailableSchedules: builder.query<
      WorkerSchedule[],
      AvailableSchedulesParams | void
    >({
      query: (params) => ({
        url: "/api/worker/schedules/available/",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "AvailableSchedules" as const,
                id: s.id,
              })),
              { type: "AvailableSchedules" as const, id: "LIST" },
            ]
          : [{ type: "AvailableSchedules" as const, id: "LIST" }],
    }),

    // GET /api/worker/schedules/my-schedules/
    getMySchedules: builder.query<WorkerMySchedule[], MySchedulesParams | void>(
      {
        query: (params) => ({
          url: "/api/worker/schedules/my-schedules/",
          method: "GET",
          params: params ?? undefined,
        }),
        transformResponse: unwrapResponse,
        providesTags: (result) =>
          result
            ? [
                ...result.map((s) => ({
                  type: "MySchedules" as const,
                  id: s.id,
                })),
                { type: "MySchedules" as const, id: "LIST" },
              ]
            : [{ type: "MySchedules" as const, id: "LIST" }],
      },
    ),

    claimSchedule: builder.mutation<ClaimScheduleResult, number>({
      query: (scheduleId) => ({
        url: `/api/worker/schedules/${scheduleId}/claim/`,
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        { type: "AvailableSchedules", id: "LIST" },
        { type: "MySchedules", id: "LIST" },
      ],
    }),

    cancelAssignment: builder.mutation<
      CancelAssignmentResult,
      { assignmentId: number; reason: string }
    >({
      query: ({ assignmentId, reason }) => ({
        url: `/api/worker/assignments/${assignmentId}/cancel/`,
        method: "POST",
        data: { reason },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        { type: "AvailableSchedules", id: "LIST" },
        { type: "MySchedules", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAvailableSchedulesQuery,
  useGetMySchedulesQuery,
  useClaimScheduleMutation,
  useCancelAssignmentMutation,
} = jobsApi;
