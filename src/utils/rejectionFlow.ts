import type { WorkerProfileResponse } from "@/types/WorkerProfile";

export type WizardStepKey =
  | "portrait"
  | "identity"
  | "service"
  | "experience"
  | "personal-info";

type StepRoute =
  | "/(profile-setup)/portrait"
  | "/(profile-setup)/identity"
  | "/(profile-setup)/service"
  | "/(profile-setup)/experience"
  | "/(profile-setup)/personal-info";

// Thứ tự chuẩn để duyệt qua khi sửa lỗi bị từ chối — dùng chung bởi
// ProfileStatusCard, my-profile, và từng bước trong wizard. "area" (khu
// vực hoạt động) không có mặt vì không nằm trong FieldKey mà admin có
// thể đánh dấu sai (xem WorkerDetailModal).
const STEP_ORDER: WizardStepKey[] = [
  "portrait",
  "identity",
  "service",
  "experience",
  "personal-info",
];

const FIELD_TO_STEP: Record<string, WizardStepKey> = {
  portrait: "portrait",
  identity_number: "identity",
  identity_front: "identity",
  identity_back: "identity",
  service_id: "service",
  bio: "experience",
  experience_years: "experience",
  certificate_file: "experience",
  first_name: "personal-info",
  last_name: "personal-info",
  phone_number: "personal-info",
  gender: "personal-info",
  birth_date: "personal-info",
};

const STEP_ROUTE: Record<WizardStepKey, StepRoute> = {
  portrait: "/(profile-setup)/portrait",
  identity: "/(profile-setup)/identity",
  service: "/(profile-setup)/service",
  experience: "/(profile-setup)/experience",
  "personal-info": "/(profile-setup)/personal-info",
};

export function stepRoute(step: WizardStepKey): StepRoute {
  return STEP_ROUTE[step];
}

/** Danh sách bước (theo đúng thứ tự wizard) có ít nhất 1 field bị admin từ chối. */
export function getRejectedSteps(
  rejectedFields: Record<string, string> | undefined | null,
): WizardStepKey[] {
  if (!rejectedFields) return [];
  const stepsWithIssue = new Set<WizardStepKey>();
  Object.keys(rejectedFields).forEach((field) => {
    const step = FIELD_TO_STEP[field];
    if (step) stepsWithIssue.add(step);
  });
  return STEP_ORDER.filter((step) => stepsWithIssue.has(step));
}

/**
 * Bước cần tới tiếp theo trong luồng "sửa lỗi bị từ chối", tính từ bước
 * hiện tại. Trả về null nếu không còn bước nào cần sửa -> nên submit lại
 * và chuyển sang màn success.
 */
export function getNextRejectedStep(
  rejectedFields: Record<string, string> | undefined | null,
  currentStep: WizardStepKey,
): WizardStepKey | null {
  const steps = getRejectedSteps(rejectedFields);
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const next = steps.find((s) => STEP_ORDER.indexOf(s) > currentIdx);
  return next ?? null;
}

/** Lý do admin đánh dấu sai cho 1 field cụ thể (chỉ có ý nghĩa khi hồ sơ đang REJECTED). */
export function fieldRejectionNote(
  profile: Pick<WorkerProfileResponse, "status" | "rejected_fields">,
  field: string,
): string | null {
  if (profile.status !== "REJECTED") return null;
  return profile.rejected_fields?.[field] ?? null;
}

/**
 * Field bị khóa (hiện dữ liệu cũ nhưng không cho sửa): hồ sơ đang REJECTED
 * và field này KHÔNG nằm trong danh sách admin đánh dấu sai.
 */
export function isFieldLocked(
  profile:
    | Pick<WorkerProfileResponse, "status" | "rejected_fields">
    | undefined,
  field: string,
): boolean {
  if (!profile || profile.status !== "REJECTED") return false;
  return !(field in (profile.rejected_fields ?? {}));
}
