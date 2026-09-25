import { baseApi, UPLOAD_TIMEOUT_MS } from "@/store/baseApi";
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
} from "@/types/Schedule";
import type { PickedFile } from "@/types/WorkerProfile";

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

/**
 * BE trả { message, data: { results, count, page, has_next, ... } } khi list
 * chính (phân trang) và { message, data: [...] } khi có booking_id (không
 * phân trang). Chuẩn hóa cả hai về Paginated<T>.
 */
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
  // Bóc từng lớp .data cho tới khi gặp mảng hoặc object có results
  let payload = response;
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(payload) || Array.isArray(payload?.results)) break;
    if (payload?.data === undefined) break;
    payload = payload.data;
  }

  // Trường hợp có booking_id: BE trả mảng thẳng, không phân trang
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

// Dành cho các nơi còn dùng list dạng mảng (màn chi tiết cũ): lấy results.
const unwrapList = <T>(response: any): T[] =>
  unwrapPaginated<T>(response).results ?? [];

/**
 * Cấu hình "infinite list" cho RTK Query: mọi trang dùng CHUNG 1 cache entry
 * (bỏ `page` khỏi cache key), trang sau được nối vào cuối, trang 1 thay thế
 * toàn bộ (dùng cho refresh). Chống trùng theo id phòng khi dữ liệu dịch
 * chuyển giữa 2 lần tải trang.
 */
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
    if (arg.page <= 1) return incoming;
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
    /* ---------------------------------------------------------------
     * DANH SÁCH PHÂN TRANG (màn Việc làm)
     * Không dùng providesTags: refetch theo tag sẽ gọi lại đúng trang
     * đang mở và nối vào cache. Màn hình tự refresh về trang 1 khi focus
     * lại / kéo để làm mới (xem usePagedJobs).
     * ------------------------------------------------------------- */

    // GET /api/worker/schedules/available/?group_by=booking&page=N
    // Mỗi đơn (booking) 1 dòng = buổi trống gần nhất + available_sessions.
    getAvailableJobsPaged: builder.query<
      Paginated<WorkerSchedule>,
      AvailableJobsPagedArgs
    >({
      query: ({ page, ...filters }) => ({
        url: "/api/worker/schedules/available/",
        method: "GET",
        params: { ...filters, page, group_by: "booking" },
      }),
      transformResponse: (r: any) => unwrapPaginated<WorkerSchedule>(r),
      ...pagedCacheConfig<WorkerSchedule, AvailableJobsPagedArgs>(),
    }),

    // GET /api/worker/schedules/my-schedules/?page=N
    getMyJobsPaged: builder.query<Paginated<WorkerMySchedule>, MyJobsPagedArgs>(
      {
        query: ({ page, ...filters }) => ({
          url: "/api/worker/schedules/my-schedules/",
          method: "GET",
          params: { ...filters, page },
        }),
        transformResponse: (r: any) => unwrapPaginated<WorkerMySchedule>(r),
        ...pagedCacheConfig<WorkerMySchedule, MyJobsPagedArgs>(),
      },
    ),

    /* ---------------------------------------------------------------
     * LIST DẠNG MẢNG (màn chi tiết hiện tại còn dùng)
     * Chỉ lấy trang đầu. Màn chi tiết sẽ được viết lại ở bước sau,
     * dùng ?booking_id= để lấy đủ các buổi của 1 đơn.
     * ------------------------------------------------------------- */

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
      transformResponse: (r: any) => unwrapList<WorkerSchedule>(r),
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
        transformResponse: (r: any) => unwrapList<WorkerMySchedule>(r),
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

    // GET /api/worker/bookings/:bookingId/schedules/
    // Toàn bộ buổi của 1 gói (kể cả đã có người nhận), kèm claim_state.
    getBookingSchedules: builder.query<WorkerSchedule[], number>({
      query: (bookingId) => ({
        url: `/api/worker/bookings/${bookingId}/schedules/`,
        method: "GET",
      }),
      transformResponse: (r: any) => unwrapList<WorkerSchedule>(r),
      // Dùng chung tag LIST với available/mine để tự refetch mỗi khi có
      // ai claim/cancel (kể cả người khác) — nhờ vậy khi quay lại đơn,
      // buổi mình vừa nhận sẽ hiện MINE thay vì biến mất khỏi danh sách.
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "AvailableSchedules" as const,
                id: s.id,
              })),
              { type: "AvailableSchedules" as const, id: "LIST" },
              { type: "MySchedules" as const, id: "LIST" },
            ]
          : [
              { type: "AvailableSchedules" as const, id: "LIST" },
              { type: "MySchedules" as const, id: "LIST" },
            ],
    }),

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
          timeout: UPLOAD_TIMEOUT_MS,
        };
      },

      transformResponse: unwrapResponse,

      invalidatesTags: (result, error, { scheduleId }) => [
        { type: "MySchedules", id: scheduleId },
      ],
    }),

    // POST /api/worker/bookings/:bookingId/claim/
    // Không truyền scheduleIds = nhận toàn bộ buổi trống; có = chỉ nhận các buổi đó.
    claimBookingPackage: builder.mutation<
      ClaimBookingPackageResult,
      number | { bookingId: number; scheduleIds?: number[] }
    >({
      query: (arg) => {
        const { bookingId, scheduleIds } =
          typeof arg === "number"
            ? { bookingId: arg, scheduleIds: undefined }
            : arg;
        return {
          url: `/api/worker/bookings/${bookingId}/claim/`,
          method: "POST",
          data: scheduleIds?.length ? { schedule_ids: scheduleIds } : undefined,
        };
      },
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
  useGetAvailableJobsPagedQuery,
  useGetMyJobsPagedQuery,
  useGetAvailableSchedulesQuery,
  useGetMySchedulesQuery,
  useGetBookingSchedulesQuery,
  useClaimBookingPackageMutation,
  useClaimScheduleMutation,
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
  useUploadScheduleImageMutation,
} = jobsApi;
