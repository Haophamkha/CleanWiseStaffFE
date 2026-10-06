import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { clearAuth } from "@/features/auth/stores/authSlice";
import { storage } from "@/utils/storage";
import { showErrorToast } from "@/utils/toast";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { router } from "expo-router";

const DEFAULT_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 30000;

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/worker/register/",
  "/api/auth/forgot-password/",
  "/api/auth/verify-reset-otp/",
  "/api/auth/reset-password/",
  "/api/auth/token/refresh/",
  "/api/auth/logout/",
];

const REFRESH_URL = "/api/auth/token/refresh/";
const LOGOUT_URL = "/api/auth/logout/";

const isValidToken = (t: string | null | undefined): t is string =>
  !!t && t !== "undefined" && t !== "null";

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

const SENSITIVE_KEYS = [
  "account_number",
  "password",
  "password_confirm",
  "new_password",
  "new_password_confirm",
  "refresh",
  "access",
];

const redact = (body: unknown) => {
  if (!body || typeof body !== "object") return body;
  const copy: Record<string, unknown> = {
    ...(body as Record<string, unknown>),
  };
  for (const key of SENSITIVE_KEYS) {
    if (key in copy) copy[key] = "[REDACTED]";
  }
  return copy;
};

axiosInstance.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublic) {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (isValidToken(token)) {
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
              ? { uri: value.uri, type: value.type, name: value.name }
              : value,
          ],
        ),
      );
    }

    console.log("[REQUEST]", config.method?.toUpperCase(), config.url, {
      hasAuthHeader: !!config.headers?.Authorization,
      body: redact(rawLoggedBody),
      timeout: config.timeout,
    });
  }

  return config;
});

/* =========================================================
 * REFRESH TOKEN (1 promise dùng chung cho HTTP và WebSocket)
 * ======================================================= */

const doRefresh = async (): Promise<string> => {
  const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!isValidToken(refreshToken)) throw new Error("NO_REFRESH_TOKEN");

  // axios thường (không qua axiosInstance) để tránh interceptor chạy vòng lặp
  const response = await axios.post(
    `${ENV.API_URL}${REFRESH_URL}`,
    { refresh: refreshToken },
    { timeout: 10000 },
  );

  const data = response.data?.data ?? response.data;
  if (typeof data?.access !== "string") throw new Error("BAD_REFRESH_RESPONSE");

  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  // BE bật ROTATE_REFRESH_TOKENS: BẮT BUỘC lưu refresh mới
  if (typeof data.refresh === "string") {
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  }
  return data.access;
};

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> =>
  (refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  }));

// Chỉ logout khi BE TỪ CHỐI refresh token. Mất mạng / timeout / 5xx / 429 thì giữ phiên.
const shouldLogout = async (e: unknown): Promise<boolean> => {
  if (e instanceof Error && e.message === "NO_REFRESH_TOKEN") {
    return isValidToken(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  }
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    return status === 400 || status === 401 || status === 403;
  }
  return true; // BAD_REFRESH_RESPONSE
};

/* =========================================================
 * LOGOUT (dùng chung cho tự động và nút Đăng xuất)
 * ======================================================= */

let isLoggingOut = false;

export const performLogout = async (
  redirectTo: string = "/(auth)/login",
): Promise<void> => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    const refresh = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const pushToken = await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);

    // Báo BE thu hồi refresh token + xóa push token; lỗi mạng thì bỏ qua
    if (isValidToken(refresh)) {
      axios
        .post(
          `${ENV.API_URL}${LOGOUT_URL}`,
          {
            refresh,
            ...(isValidToken(pushToken) && { push_token: pushToken }),
          },
          { timeout: 5000 },
        )
        .catch(() => {});
    }

    await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
  } finally {
    // clearAuth TRƯỚC khi điều hướng, để useAuthGuard không đẩy ngược về Home
    authDispatch?.(clearAuth());
    authDispatch?.(baseApi.util.resetApiState());
    router.replace(redirectTo as any);
    isLoggingOut = false;
  }
};

/* =========================================================
 * RATE LIMIT (429)
 * ======================================================= */

let lastRateLimitToastAt = 0;

const showRateLimitToast = (retryAfter?: string) => {
  const now = Date.now();
  if (now - lastRateLimitToastAt < 3000) return; // tránh spam toast
  lastRateLimitToastAt = now;
  showErrorToast(
    "Thao tác quá nhanh",
    retryAfter
      ? `Vui lòng thử lại sau ${retryAfter} giây.`
      : "Vui lòng thử lại sau ít giây.",
  );
};

/* =========================================================
 * RESPONSE INTERCEPTOR
 * ======================================================= */

const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__ && !response.config.url?.includes("/api/auth/")) {
      console.log("[RESPONSE OK]", response.config.url, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (__DEV__) {
      // ECONNABORTED kèm response undefined thường là timeout phía client
      console.log("[RESPONSE ERROR]", originalRequest?.url, {
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        message: error.message,
      });
    }

    if (!originalRequest) return Promise.reject(error);

    // Bị giới hạn tần suất: báo người dùng, không refresh, không retry
    if (error.response?.status === 429) {
      showRateLimitToast(
        error.response.headers?.["retry-after"] as string | undefined,
      );
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) return Promise.reject(error);

    // Endpoint public: 401 là lỗi nghiệp vụ, không refresh, không logout
    const isPublic = PUBLIC_ENDPOINTS.some((p) =>
      originalRequest.url?.includes(p),
    );
    if (isPublic || originalRequest._retry) return Promise.reject(error);

    originalRequest._retry = true;

    // Request dùng token cũ nhưng storage đã có token mới (request khác vừa
    // refresh xong): gửi lại bằng token mới, không refresh thêm
    const sentAuth = (
      originalRequest.headers as Record<string, string> | undefined
    )?.Authorization;
    const current = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (isValidToken(current) && sentAuth !== `Bearer ${current}`) {
      setAuthHeader(originalRequest, current);
      return axiosInstance(originalRequest);
    }

    try {
      const token = await refreshAccessToken();
      setAuthHeader(originalRequest, token);
      // Không await: lỗi của request retry không được rơi vào catch bên dưới
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (await shouldLogout(refreshError)) await performLogout();
      return Promise.reject(error);
    }
  },
);

/* =========================================================
 * IDEMPOTENCY AUTO-RETRY
 * =========================================================
 * BE trả 409 kèm error_code "IDEMPOTENCY_PROCESSING" khi 1 request khác
 * với CÙNG Idempotency-Key đang xử lý dở. Không phải lỗi nghiệp vụ nên an
 * toàn để tự đợi rồi gọi lại. Chỉ retry khi request gốc có header
 * Idempotency-Key.
 */

const IDEMPOTENCY_RETRY_DELAY_MS = 1500;
const IDEMPOTENCY_MAX_RETRIES = 5;
const TIMEOUT_MAX_RETRIES = 1;
export const ACTION_TIMEOUT_MS = 15000;

const isTimeoutError = (error: AxiosError): boolean =>
  !error.response &&
  (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");

const isIdempotencyProcessing = (error: AxiosError): boolean => {
  const data = error.response?.data as { error_code?: string } | undefined;
  return (
    error.response?.status === 409 &&
    data?.error_code === "IDEMPOTENCY_PROCESSING"
  );
};

const hasIdempotencyKey = (config: AxiosRequestConfig): boolean => {
  const headers = config.headers as Record<string, string> | undefined;
  return !!headers?.["Idempotency-Key"];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
 * AXIOS BASE QUERY
 * ======================================================= */

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
  params?: Record<string, unknown>;
  /** Ghi đè timeout mặc định (10s), dùng UPLOAD_TIMEOUT_MS cho request có file. */
  timeout?: number;
  /** Header tùy chỉnh, vd { "Idempotency-Key": "..." }. */
  headers?: Record<string, string>;
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
  /** true khi request KHÔNG nhận được response từ server (timeout, mất mạng...). */
  isNetworkError?: boolean;
  /** Mã lỗi gốc của axios, vd "ECONNABORTED", "ERR_NETWORK". */
  code?: string;
  /** Số giây chờ từ header Retry-After khi bị 429. */
  retryAfter?: number;
};

const axiosBaseQuery = (): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  AxiosBaseQueryError
> => {
  return async (args: AxiosBaseQueryArgs) => {
    const { url, method, data, params, timeout, headers } = args;

    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      ...(timeout !== undefined && { timeout }),
      ...(headers !== undefined && { headers }),
    };

    let timeoutRetries = 0;

    for (let attempt = 0; attempt <= IDEMPOTENCY_MAX_RETRIES; attempt++) {
      try {
        const result = await axiosInstance(requestConfig);
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError as AxiosError;

        // Request có Idempotency-Key thì gọi lại cùng key là an toàn:
        // BE trả kết quả cũ hoặc 409 PROCESSING (đợi rồi thử tiếp).
        const shouldRetry =
          hasIdempotencyKey(requestConfig) &&
          attempt < IDEMPOTENCY_MAX_RETRIES &&
          (isIdempotencyProcessing(err) ||
            (isTimeoutError(err) && ++timeoutRetries <= TIMEOUT_MAX_RETRIES));

        if (shouldRetry) {
          if (__DEV__) {
            console.log("[IDEMPOTENCY RETRY]", url, `attempt ${attempt + 1}`);
          }
          await sleep(IDEMPOTENCY_RETRY_DELAY_MS);
          continue;
        }

        const hasServerResponse = !!err.response;
        const retryAfter = Number(err.response?.headers?.["retry-after"]);

        return {
          error: {
            status: err.response?.status,
            data: hasServerResponse ? err.response?.data : undefined,
            isNetworkError: !hasServerResponse,
            code: err.code,
            ...(retryAfter > 0 && { retryAfter }),
          },
        };
      }
    }

    return { error: { isNetworkError: true } };

    return { error: { isNetworkError: true } };
  };
};

/* =========================================================
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
    "Bookings",
    "Wallet",
    "WalletTransactions",
    "Notifications",
    "Complaints",
  ],

  endpoints: () => ({}),
});
