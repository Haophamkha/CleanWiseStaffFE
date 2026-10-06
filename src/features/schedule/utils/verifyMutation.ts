import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import { getErrorMessage, isNetworkError } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const POLL_TRIES = 6;
const POLL_DELAY_MS = 2000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lỗi mà ta chưa biết BE đã xử lý xong hay chưa: mất mạng, timeout, hoặc 409 đang xử lý. */
export const isUncertainError = (err: any): boolean =>
  isNetworkError(err) ||
  (err?.status === 409 && err?.data?.error_code === "IDEMPOTENCY_PROCESSING");

/** Hỏi lại BE vài lần (tối đa ~10s) cho tới khi điều kiện đúng. */
export async function pollSchedules(
  refetch: () => Promise<{ data?: WorkerSchedule[] }>,
  check: (list: WorkerSchedule[]) => boolean,
): Promise<boolean> {
  for (let i = 0; i < POLL_TRIES; i++) {
    try {
      const fresh = await refetch();
      if (check(fresh?.data ?? [])) return true;
    } catch {}
    if (i < POLL_TRIES - 1) await sleep(POLL_DELAY_MS);
  }
  return false;
}

export async function verifyScheduleMutation({
  err,
  scheduleId,
  refetch,
  isNowSuccess,
  successTitle,
  successMessage,
  errorTitle,
  onSuccess,
}: {
  err: any;
  scheduleId: number;
  refetch: () => Promise<{ data?: WorkerSchedule[] }>;
  isNowSuccess: (schedule: WorkerSchedule) => boolean;
  successTitle: string;
  successMessage: string;
  errorTitle: string;
  onSuccess?: () => void;
}): Promise<void> {
  if (isUncertainError(err)) {
    const ok = await pollSchedules(refetch, (list) => {
      const updated = list.find((s) => s.id === scheduleId);
      return !!updated && isNowSuccess(updated);
    });
    if (ok) {
      showSuccessToast(
        successTitle,
        `${successMessage} (Mạng chập chờn nhưng hệ thống đã ghi nhận.)`,
      );
      onSuccess?.();
      return;
    }
  }

  showErrorToast(errorTitle, getErrorMessage(err));
}
