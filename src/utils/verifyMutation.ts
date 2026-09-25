import { Alert } from "react-native";

import type { WorkerSchedule } from "@/types/Schedule";
import { getErrorMessage, isNetworkError } from "@/utils/apiError";

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
  if (isNetworkError(err)) {
    try {
      const fresh = await refetch();
      const updated = fresh?.data?.find((s) => s.id === scheduleId);
      if (updated && isNowSuccess(updated)) {
        Alert.alert(
          successTitle,
          `${successMessage} (Kết nối mạng bị gián đoạn lúc nhận phản hồi, nhưng hệ thống đã ghi nhận thao tác của bạn.)`,
        );
        onSuccess?.();
        return;
      }
    } catch {}
  }

  Alert.alert(errorTitle, getErrorMessage(err));
}
