import { STORAGE_KEYS } from "@/config/constants";
import { baseApi } from "@/store/baseApi";
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
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
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
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
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
      query: (fields) => ({
        url: "/api/auth/worker/profile/",
        method: "PATCH",
        data: buildWorkerProfileFormData(fields),
      }),
      transformResponse: unwrapResponse,
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
