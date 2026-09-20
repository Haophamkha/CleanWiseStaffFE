import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { clearAuth } from "@/store/authSlice";
import { store } from "@/store/store";
import { storage } from "@/utils/storage";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { router } from "expo-router";

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/forgot-password/",
  "/api/auth/verify-reset-otp/",
  "/api/auth/reset-password/",
  "/api/auth/refresh/",
];

const REFRESH_URL = "/api/auth/refresh/";

axiosInstance.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublic) {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (__DEV__) {
    const loggedBody =
      config.data instanceof FormData
        ? Object.fromEntries(
            ((config.data as any)._parts ?? []).map(
              ([key, value]: [string, any]) => [
                key,
                value && typeof value === "object" && "uri" in value
                  ? { uri: value.uri, type: value.type, name: value.name }
                  : value,
              ],
            ),
          )
        : config.data;

    console.log("[REQUEST]", config.method?.toUpperCase(), config.url, {
      hasAuthHeader: !!config.headers.Authorization,
      body: loggedBody,
    });
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  pendingQueue = [];
};

// Nguồn duy nhất để logout: luôn dọn storage + Redux + điều hướng cùng lúc,
// tránh tình trạng Redux còn "authenticated" trong khi storage đã rỗng
// (chính là nguyên nhân app tự bật lại vào (tabs) sau khi bị 401).
const logoutAndRedirect = async () => {
  await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
  store.dispatch(clearAuth());
  router.replace("/(auth)/login");
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("[RESPONSE OK]", response.config.url, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (__DEV__) {
      console.log("[RESPONSE ERROR]", originalRequest?.url, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    const isAuthEndpoint = PUBLIC_ENDPOINTS.some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      if (error.response?.status === 401 && isAuthEndpoint) {
        await logoutAndRedirect();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            (originalRequest.headers as any).Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken || refreshToken === "undefined") {
        throw new Error("Không có refresh token");
      }

      const res = await axios.post(`${ENV.API_URL}${REFRESH_URL}`, {
        refresh: refreshToken,
      });

      const newAccessToken: string = res.data?.data?.access ?? res.data?.access;
      if (!newAccessToken) throw new Error("Refresh không trả về access token");

      await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as any).Authorization =
        `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await logoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: any;
  params?: any;
};

const axiosBaseQuery = (): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  unknown
> => {
  return async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Profile", "WorkingAreas"],
  endpoints: () => ({}),
});
