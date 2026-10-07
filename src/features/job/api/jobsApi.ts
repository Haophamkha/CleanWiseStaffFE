import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import type {
  AvailableJobsPagedArgs,
  AvailableSchedulesParams,
  CancelAssignmentResult,
  ClaimBookingPackageResult,
  ClaimScheduleResult,
  MyJobsPagedArgs,
  MySchedulesParams,
  Paginated,
  ScheduleImage,
  ScheduleImageType,
  WorkerMySchedule,
  WorkerSchedule,
} from "@/features/schedule/types/Schedule";
import { ACTION_TIMEOUT_MS, baseApi, UPLOAD_TIMEOUT_MS } from "@/store/baseApi";

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

const EMPTY_PAGE = {
  results: [],
  count: 0,
  page: 1,
  total_pages: 1,
  has_next: false,
  has_previous: false,
  page_size: 0,
};

const unwrapPaginated = <T>(response: any): Paginated<T> => {
  let payload = response;

  for (let i = 0; i < 3; i++) {
    if (Array.isArray(payload) || Array.isArray(payload?.results)) {
      break;
    }

    if (payload?.data === undefined) {
      break;
    }

    payload = payload.data;
  }

  if (Array.isArray(payload)) {
    return {
      results: payload,
      count: payload.length,
      page: 1,
      total_pages: 1,
      has_next: false,
      has_previous: false,
      page_size: payload.length,
    };
  }

  if (!Array.isArray(payload?.results)) {
    console.warn("[unwrapPaginated] shape lạ:", response);
    return EMPTY_PAGE as Paginated<T>;
  }

  return payload as Paginated<T>;
};

const unwrapList = <T>(response: any): T[] =>
  unwrapPaginated<T>(response).results ?? [];

const pagedCacheConfig = <
  T extends { id: number },
  A extends { page: number },
>() => ({
  serializeQueryArgs: ({
    endpointName,
    queryArgs,
  }: {
    endpointName: string;
    queryArgs: A;
  }) => {
    const { page: _page, ...rest } = queryArgs;
    return `${endpointName}:${JSON.stringify(rest)}`;
  },

  merge: (cache: Paginated<T>, incoming: Paginated<T>, { arg }: { arg: A }) => {
    if (arg.page <= 1) {
      return incoming;
    }

    const known = new Set(cache.results.map((x) => x.id));

    cache.results.push(...incoming.results.filter((x) => !known.has(x.id)));

    cache.page = incoming.page;
    cache.count = incoming.count;
    cache.total_pages = incoming.total_pages;
    cache.has_next = incoming.has_next;
    cache.has_previous = incoming.has_previous;
    cache.page_size = incoming.page_size;
  },

  forceRefetch: ({
    currentArg,
    previousArg,
  }: {
    currentArg: A | undefined;
    previousArg: A | undefined;
  }) => currentArg?.page !== previousArg?.page,
});

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableJobsPaged: builder.query<
      Paginated<WorkerSchedule>,
      AvailableJobsPagedArgs
    >({
      query: ({ page, ...filters }) => ({
        url: "/api/worker/schedules/available/",
        method: "GET",
        params: {
          ...filters,
          page,
          group_by: "booking",
        },
      }),
      transformResponse: (r: any) => unwrapPaginated<WorkerSchedule>(r),
      ...pagedCacheConfig<WorkerSchedule, AvailableJobsPagedArgs>(),
    }),

    getMyJobsPaged: builder.query<Paginated<WorkerMySchedule>, MyJobsPagedArgs>(
      {
        query: ({ page, ...filters }) => ({
          url: "/api/worker/schedules/my-schedules/",
          method: "GET",
          params: {
            ...filters,
            page,
          },
        }),
        transformResponse: (r: any) => unwrapPaginated<WorkerMySchedule>(r),
        ...pagedCacheConfig<WorkerMySchedule, MyJobsPagedArgs>(),
      },
    ),

    getAvailableSchedules: builder.query<
      WorkerSchedule[],
      AvailableSchedulesParams | void
    >({
      query: (params) => ({
        url: "/api/worker/schedules/available/",
        method: "GET",
        params: params ? { ...params } : undefined,
      }),
      transformResponse: (r: any) => unwrapList<WorkerSchedule>(r),
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "AvailableSchedules" as const,
                id: s.id,
              })),
              {
                type: "AvailableSchedules" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "AvailableSchedules" as const,
                id: "LIST",
              },
            ],
    }),

    getMySchedules: builder.query<WorkerMySchedule[], MySchedulesParams | void>(
      {
        query: (params) => ({
          url: "/api/worker/schedules/my-schedules/",
          method: "GET",
          params: params ? { ...params } : undefined,
        }),
        transformResponse: (r: any) => unwrapList<WorkerMySchedule>(r),
        providesTags: (result) =>
          result
            ? [
                ...result.map((s) => ({
                  type: "MySchedules" as const,
                  id: s.id,
                })),
                {
                  type: "MySchedules" as const,
                  id: "LIST",
                },
              ]
            : [
                {
                  type: "MySchedules" as const,
                  id: "LIST",
                },
              ],
      },
    ),

    getBookingSchedules: builder.query<WorkerSchedule[], number>({
      query: (bookingId) => ({
        url: `/api/worker/bookings/${bookingId}/schedules/`,
        method: "GET",
      }),
      transformResponse: (r: any) => unwrapList<WorkerSchedule>(r),
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "AvailableSchedules" as const,
                id: s.id,
              })),
              {
                type: "AvailableSchedules" as const,
                id: "LIST",
              },
              {
                type: "MySchedules" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "AvailableSchedules" as const,
                id: "LIST",
              },
              {
                type: "MySchedules" as const,
                id: "LIST",
              },
            ],
    }),

    claimSchedule: builder.mutation<
      ClaimScheduleResult,
      {
        scheduleId: number;
        idempotencyKey: string;
      }
    >({
      query: ({ scheduleId, idempotencyKey }) => ({
        url: `/api/worker/schedules/${scheduleId}/claim/`,
        method: "POST",
        timeout: ACTION_TIMEOUT_MS,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        {
          type: "AvailableSchedules",
          id: "LIST",
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),

    cancelAssignment: builder.mutation<
      CancelAssignmentResult,
      {
        assignmentId: number;
        reason: string;
        idempotencyKey: string;
      }
    >({
      query: ({ assignmentId, reason, idempotencyKey }) => ({
        url: `/api/worker/assignments/${assignmentId}/cancel/`,
        method: "POST",
        data: { reason },
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        {
          type: "AvailableSchedules",
          id: "LIST",
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),

    checkIn: builder.mutation<
      WorkerMySchedule,
      {
        scheduleId: number;
        latitude: number;
        longitude: number;
        accuracy?: number | null;
      }
    >({
      query: ({ scheduleId, latitude, longitude, accuracy }) => ({
        url: `/api/worker/schedules/${scheduleId}/check-in/`,
        method: "POST",
        data: { latitude, longitude, accuracy: accuracy ?? null },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { scheduleId }) => [
        {
          type: "MySchedules",
          id: scheduleId,
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),
    checkOut: builder.mutation<
      WorkerMySchedule,
      {
        scheduleId: number;
        completion_note?: string | null;
      }
    >({
      query: ({ scheduleId, completion_note }) => ({
        url: `/api/worker/schedules/${scheduleId}/check-out/`,
        method: "POST",
        data: {
          completion_note: completion_note?.trim() || null,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (_result, _error, { scheduleId }) => [
        {
          type: "MySchedules",
          id: scheduleId,
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),

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
          timeout: UPLOAD_TIMEOUT_MS,
        };
      },
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { scheduleId }) => [
        {
          type: "MySchedules",
          id: scheduleId,
        },
      ],
    }),

    claimBookingPackage: builder.mutation<
      ClaimBookingPackageResult,
      {
        bookingId: number;
        scheduleIds?: number[];
        idempotencyKey: string;
      }
    >({
      query: ({ bookingId, scheduleIds, idempotencyKey }) => ({
        url: `/api/worker/bookings/${bookingId}/claim/`,
        method: "POST",
        timeout: ACTION_TIMEOUT_MS,
        data: scheduleIds?.length ? { schedule_ids: scheduleIds } : undefined,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        {
          type: "AvailableSchedules",
          id: "LIST",
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),

    declinePreferred: builder.mutation<
      void,
      {
        bookingId: number;
        idempotencyKey: string;
      }
    >({
      query: ({ bookingId, idempotencyKey }) => ({
        url: `/api/worker/bookings/${bookingId}/decline/`,
        method: "POST",
        timeout: ACTION_TIMEOUT_MS,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        {
          type: "AvailableSchedules",
          id: "LIST",
        },
        {
          type: "MySchedules",
          id: "LIST",
        },
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAvailableJobsPagedQuery,
  useGetMyJobsPagedQuery,
  useGetAvailableSchedulesQuery,
  useGetMySchedulesQuery,
  useGetBookingSchedulesQuery,
  useClaimBookingPackageMutation,
  useDeclinePreferredMutation,
  useClaimScheduleMutation,
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useUploadScheduleImageMutation,
} = jobsApi;
