import { STORAGE_KEYS } from "@/config/constants";
import { baseApi, UPLOAD_TIMEOUT_MS } from "@/store/baseApi";
import type { Area, WorkingArea } from "@/types/Area";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterWorkerRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from "@/types/Request";
import type {
  AuthResponse,
  MessageResponse,
  RegisterWorkerResponse,
} from "@/types/Response";
import type { Service } from "@/types/Service";
import type {
  UpdateWorkerProfileRequest,
  WorkerProfileResponse,
} from "@/types/WorkerProfile";
import { storage } from "@/utils/storage";
import { buildWorkerProfileFormData } from "@/utils/workerProfileFormData";

const saveTokens = async (access: string, refresh: string) => {
  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};

const unwrapResponse = (response: any) => {
  return response?.data?.data ?? response?.data ?? response;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
          // Xóa sạch cache RTK Query (profile, schedules, wallet...) của
          // tài khoản trước đó — bắt buộc phải làm ở đây, không chỉ dựa
          // vào bước logout, vì nếu logout lỡ lỗi giữa chừng (vd storage
          // ném lỗi) thì cache cũ vẫn còn và user mới sẽ thấy data cũ.
          dispatch(baseApi.util.resetApiState());
        } catch {}
      },
    }),

    registerWorker: builder.mutation<
      RegisterWorkerResponse,
      RegisterWorkerRequest
    >({
      query: (body) => ({
        url: "/api/auth/worker/register/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
          // Cùng lý do như login: đảm bảo tài khoản vừa đăng ký không
          // dính cache của phiên trước đó.
          dispatch(baseApi.util.resetApiState());
        } catch {}
      },
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/forgot-password/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
    }),

    verifyResetOtp: builder.mutation<MessageResponse, VerifyResetOtpRequest>({
      query: (body) => ({
        url: "/api/auth/verify-reset-otp/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
    }),

    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/reset-password/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
    }),

    getWorkerProfile: builder.query<WorkerProfileResponse, void>({
      query: () => ({
        url: "/api/auth/worker/profile/",
        method: "GET",
      }),
      transformResponse: unwrapResponse,
      providesTags: ["Profile"],
    }),

    updateWorkerProfile: builder.mutation<
      WorkerProfileResponse,
      UpdateWorkerProfileRequest
    >({
      // queryFn thay vì query: buildWorkerProfileFormData giờ là async
      // (cần await fetch().blob() trên web để lấy file thật trước khi
      // gửi), mà `query` không hỗ trợ trả về Promise cho phần build args.
      // transformResponse cũng không tự áp dụng với queryFn nên phải gọi
      // unwrapResponse thủ công ở đây.
      async queryFn(fields, _queryApi, _extraOptions, baseQuery) {
        const formData = await buildWorkerProfileFormData(fields);
        const result = await baseQuery({
          url: "/api/auth/worker/profile/",
          method: "PATCH",
          data: formData,
          // Request có ảnh (multipart) cần timeout cao hơn mặc định 10s,
          // vì upload 1-2 ảnh qua mạng di động dễ mất hơn 10s -> axios
          // tự hủy (ECONNABORTED) dù BE vẫn lưu thành công phía sau.
          timeout: UPLOAD_TIMEOUT_MS,
        });
        if (result.error) {
          return { error: result.error };
        }
        return { data: unwrapResponse(result.data) as WorkerProfileResponse };
      },
      invalidatesTags: ["Profile"],
    }),

    submitWorkerProfile: builder.mutation<WorkerProfileResponse, void>({
      query: () => ({
        url: "/api/auth/worker/profile/submit/",
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Profile"],
    }),

    getActiveServices: builder.query<
      Service[],
      { search?: string; section_code?: string } | void
    >({
      query: (params) => ({
        url: "/api/services/",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapResponse,
    }),

    getActiveAreas: builder.query<Area[], void>({
      query: () => ({
        url: "/api/worker/areas/",
        method: "GET",
      }),
      transformResponse: unwrapResponse,
    }),

    getWorkingAreas: builder.query<WorkingArea[], void>({
      query: () => ({
        url: "/api/worker/working-areas/",
        method: "GET",
      }),
      transformResponse: unwrapResponse,
      providesTags: ["WorkingAreas"],
    }),

    updateWorkingAreas: builder.mutation<WorkingArea[], number[]>({
      query: (areaIds) => ({
        url: "/api/worker/working-areas/",
        method: "PUT",
        data: { area_ids: areaIds },
      }),
      transformResponse: unwrapResponse,
      async onQueryStarted(areaIds, { dispatch, queryFulfilled, getState }) {
        // Optimistic: set UI ngay bằng areaIds vừa chọn, dùng data area đã có sẵn trong cache getActiveAreas
        const activeAreasEntry = authApi.endpoints.getActiveAreas.select()(
          getState() as any,
        );
        const allAreas = activeAreasEntry.data ?? [];
        const optimisticData = allAreas
          .filter((a) => areaIds.includes(a.id))
          .map((a) => ({
            id: a.id,
            area: a,
            created_at: new Date().toISOString(),
          }));

        const patchResult = dispatch(
          authApi.util.updateQueryData(
            "getWorkingAreas",
            undefined,
            () => optimisticData as any,
          ),
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData(
              "getWorkingAreas",
              undefined,
              () => data,
            ),
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),

  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterWorkerMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useGetWorkerProfileQuery,
  useUpdateWorkerProfileMutation,
  useSubmitWorkerProfileMutation,
  useGetActiveServicesQuery,
  useGetActiveAreasQuery,
  useGetWorkingAreasQuery,
  useUpdateWorkingAreasMutation,
} = authApi;
