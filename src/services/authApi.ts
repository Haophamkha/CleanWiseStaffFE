import { STORAGE_KEYS } from "@/config/constants";
import { baseApi } from "@/store/baseApi";
import type { LoginRequest } from "@/types/Request";
import type { AuthResponse } from "@/types/Response";
import { storage } from "@/utils/storage";

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
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
