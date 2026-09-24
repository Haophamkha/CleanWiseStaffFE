import { baseApi } from "@/store/baseApi";
import type {
  AvailableSchedulesParams,
  CancelAssignmentResult,
  ClaimScheduleResult,
  MySchedulesParams,
  ScheduleImage,
  ScheduleImageType,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/types/Schedule";
import type { PickedFile } from "@/types/WorkerProfile";

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

    // POST /api/worker/schedules/:id/check-in/
    checkIn: builder.mutation<WorkerMySchedule, number>({
      query: (scheduleId) => ({
        url: `/api/worker/schedules/${scheduleId}/check-in/`,
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, scheduleId) => [
        { type: "MySchedules", id: scheduleId },
        { type: "MySchedules", id: "LIST" },
      ],
    }),

    // POST /api/worker/schedules/:id/check-out/
    checkOut: builder.mutation<WorkerMySchedule, number>({
      query: (scheduleId) => ({
        url: `/api/worker/schedules/${scheduleId}/check-out/`,
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, scheduleId) => [
        { type: "MySchedules", id: scheduleId },
        { type: "MySchedules", id: "LIST" },
      ],
    }),

    // POST /api/worker/schedules/:id/images/ (multipart)
    uploadScheduleImage: builder.mutation<
      ScheduleImage,
      {
        scheduleId: number;
        image: PickedFile;
        imageType: ScheduleImageType;
        note?: string;
      }
    >({
      query: ({ scheduleId, image, imageType, note }) => {
        const formData = new FormData();

        formData.append("image", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);

        formData.append("image_type", imageType);

        if (note) {
          formData.append("note", note);
        }

        return {
          url: `/api/worker/schedules/${scheduleId}/images/`,
          method: "POST",
          data: formData,
        };
      },

      transformResponse: unwrapResponse,

      invalidatesTags: (result, error, { scheduleId }) => [
        { type: "MySchedules", id: scheduleId },
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
  useCheckInMutation,
  useCheckOutMutation,
  useUploadScheduleImageMutation,
} = jobsApi;
