import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { clearAuth } from "@/store/authSlice";
import { storage } from "@/utils/storage";

import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { createApi } from "@reduxjs/toolkit/query/react";

import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { router } from "expo-router";

/* =========================================================
 * AXIOS INSTANCE
 * ======================================================= */

// Timeout mặc định cho các request bình thường (JSON, không kèm file).
// Request có upload ảnh (multipart) cần timeout riêng cao hơn nhiều —
// xem DEFAULT_UPLOAD_TIMEOUT_MS và cách truyền `timeout` qua args bên
// dưới, vì 1-2 ảnh gửi qua mạng di động dễ mất hơn 10s, dẫn tới axios tự
// hủy request (ECONNABORTED) dù BE vẫn lưu thành công phía sau, khiến
// app báo "thất bại" trong khi dữ liệu thực ra đã lưu đúng.
const DEFAULT_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 30000;

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
});

/* =========================================================
 * PUBLIC ENDPOINTS
 * ======================================================= */

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/worker/register/",
  "/api/auth/forgot-password/",
  "/api/auth/verify-reset-otp/",
  "/api/auth/reset-password/",
  "/api/auth/refresh/",
];

const REFRESH_URL = "/api/auth/refresh/";

/* =========================================================
 * REDUX DISPATCH
 * ======================================================= */

let authDispatch: Dispatch<UnknownAction> | null = null;

export const registerAuthDispatch = (dispatch: Dispatch<UnknownAction>) => {
  authDispatch = dispatch;
};

/* =========================================================
 * REQUEST INTERCEPTOR
 * ======================================================= */

axiosInstance.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublic) {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && token !== "undefined" && token !== "null") {
      config.headers = config.headers ?? {};

      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (__DEV__) {
    let rawLoggedBody: unknown = config.data;

    if (config.data instanceof FormData) {
      rawLoggedBody = Object.fromEntries(
        ((config.data as any)._parts ?? []).map(
          ([key, value]: [string, any]) => [
            key,
            value && typeof value === "object" && "uri" in value
              ? {
                  uri: value.uri,
                  type: value.type,
                  name: value.name,
                }
              : value,
          ],
        ),
      );
    }

    const loggedBody =
      rawLoggedBody &&
      typeof rawLoggedBody === "object" &&
      Object.prototype.hasOwnProperty.call(rawLoggedBody, "account_number")
        ? {
            ...(rawLoggedBody as Record<string, unknown>),
            account_number: "[REDACTED]",
          }
        : rawLoggedBody;

    console.log("[REQUEST]", config.method?.toUpperCase(), config.url, {
      hasAuthHeader: !!config.headers?.Authorization,

      body: loggedBody,

      timeout: config.timeout,
    });
  }

  return config;
});

/* =========================================================
 * REFRESH TOKEN
 * ======================================================= */

let isRefreshing = false;

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let pendingQueue: PendingRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  pendingQueue = [];
};

/* =========================================================
 * LOGOUT
 * ======================================================= */

const logoutAndRedirect = async (): Promise<void> => {
  await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);

  await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);

  // Xóa Redux user
  authDispatch?.(clearAuth());

  // Xóa toàn bộ RTK Query cache
  authDispatch?.(baseApi.util.resetApiState());

  router.replace("/(auth)/login");
};

/* =========================================================
 * RESPONSE INTERCEPTOR
 * ======================================================= */

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("[RESPONSE OK]", response.config.url, response.data);
    }

    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (__DEV__) {
      // error.code === "ECONNABORTED" kèm response undefined thường là
      // timeout (axios tự hủy request phía client), không phải lỗi BE
      // trả về — log thêm error.code/message để phân biệt 2 trường hợp
      // ngay trên terminal, không cần đoán.
      console.log("[RESPONSE ERROR]", originalRequest?.url, {
        status: error.response?.status,

        data: error.response?.data,

        code: error.code,

        message: error.message,
      });
    }

    /* -----------------------------------------------------
     * Không có request gốc
     * --------------------------------------------------- */

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = PUBLIC_ENDPOINTS.some((path) =>
      originalRequest.url?.includes(path),
    );

    /* -----------------------------------------------------
     * Không phải 401
     * --------------------------------------------------- */

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    /* -----------------------------------------------------
     * Auth endpoint bị 401
     * --------------------------------------------------- */

    if (isAuthEndpoint) {
      await logoutAndRedirect();

      return Promise.reject(error);
    }

    /* -----------------------------------------------------
     * Request đã retry rồi
     * --------------------------------------------------- */

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    /* -----------------------------------------------------
     * Đang refresh token
     * --------------------------------------------------- */

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};

            (originalRequest.headers as Record<string, string>).Authorization =
              `Bearer ${token}`;

            resolve(axiosInstance(originalRequest));
          },

          reject,
        });
      });
    }

    /* -----------------------------------------------------
     * Bắt đầu refresh
     * --------------------------------------------------- */

    originalRequest._retry = true;

    isRefreshing = true;

    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (
        !refreshToken ||
        refreshToken === "undefined" ||
        refreshToken === "null"
      ) {
        throw new Error("Không có refresh token");
      }

      /**
       * Dùng axios thường thay vì
       * axiosInstance để tránh interceptor
       * refresh token chạy vòng lặp.
       */
      const response = await axios.post(`${ENV.API_URL}${REFRESH_URL}`, {
        refresh: refreshToken,
      });

      const newAccessToken =
        response.data?.data?.access ?? response.data?.access;

      if (!newAccessToken || typeof newAccessToken !== "string") {
        throw new Error("Refresh không trả về access token");
      }

      /* Lưu access token mới */

      await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      /* Xử lý các request đang chờ */

      processQueue(null, newAccessToken);

      /* Retry request ban đầu */

      originalRequest.headers = originalRequest.headers ?? {};

      (originalRequest.headers as Record<string, string>).Authorization =
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

/* =========================================================
 * AXIOS BASE QUERY
 * ======================================================= */

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
  params?: Record<string, unknown>;
  /** Ghi đè timeout mặc định (10s) — dùng UPLOAD_TIMEOUT_MS cho request có file. */
  timeout?: number;
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
};

const axiosBaseQuery = (): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  AxiosBaseQueryError
> => {
  return async (args: AxiosBaseQueryArgs) => {
    const { url, method, data, params, timeout } = args;

    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        ...(timeout !== undefined && { timeout }),
      });

      return {
        data: result.data,
      };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      return {
        error: {
          status: err.response?.status,

          data: err.response?.data ?? err.message,
        },
      };
    }
  };
};

/* =========================================================
 * RTK QUERY
 * ======================================================= */

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "Profile",
    "WorkingAreas",
    "PaymentMethods",
    "BankCatalog",
    "AvailableSchedules",
    "MySchedules",
    "ChatConversations",

    // Booking
    "Bookings",

    // Wallet
    "Wallet",
    "WalletTransactions",
  ],

  endpoints: () => ({}),
});
