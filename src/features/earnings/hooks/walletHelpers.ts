import * as Crypto from "expo-crypto";
import { useRef } from "react";

export const TOPUP_MIN = 1000;
export const TOPUP_MAX = 20000000;
export const WITHDRAW_MIN = 1000;
export const WITHDRAW_MAX = 2000000;
export const MIN_ESCROW_BALANCE = 400000;
export const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];
export const POLL_MS = 3000;

/** Key gắn với "ý định" (chữ ký = số tiền + tài khoản). Đổi chữ ký thì sinh key mới. */
export function useIntentKey() {
  const ref = useRef<{ sig: string; key: string } | null>(null);
  const getKey = (sig: string) => {
    if (!ref.current || ref.current.sig !== sig) {
      ref.current = { sig, key: Crypto.randomUUID() };
    }
    return ref.current.key;
  };
  const resetKey = () => {
    ref.current = null;
  };
  return { getKey, resetKey };
}

/** Chưa rõ BE đã xử lý chưa: mất mạng, timeout, 409, 5xx. Phải giữ nguyên key khi thử lại. */
export const isUncertain = (err: any) => {
  if (err?.isNetworkError) return true;
  const s = err?.status;
  return !s || s === 409 || s >= 500;
};

/** Bóc thông báo lỗi từ response BE. */
export function errorMessage(err: any, fallback: string): string {
  const data = err?.data;
  if (!data || typeof data === "string") return fallback;
  const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);
  const candidates = [
    first(data.errors && data.errors[Object.keys(data.errors)[0]]),
    data.message,
    typeof data.detail === "string" ? data.detail : undefined,
    first(data.amount),
    first(data.payment_method_id),
    first(data.non_field_errors),
    Array.isArray(data)
      ? data.find((m: unknown) => typeof m === "string")
      : undefined,
  ];
  const found = candidates.find((m) => typeof m === "string" && m);
  return (found as string) ?? fallback;
}
