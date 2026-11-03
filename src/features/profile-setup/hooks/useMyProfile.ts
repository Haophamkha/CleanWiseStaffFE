import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { type ThemeColors } from "@/constants/theme";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import type { WorkerProfileResponse } from "@/features/profile-setup/types/WorkerProfile";
import {
    getRejectedSteps,
    stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import {
    getProfileStatusInfo,
    type ProfileStatusInfo,
} from "@/features/profile/hooks/useProfile";
import { resolveMediaUrl } from "@/utils/media";
import { router } from "expo-router";
import { useMemo } from "react";

export type InfoRowData = { label: string; value: string };

export type ProfileImage = {
  uri: string;
  rejected: boolean;
  note: string;
};

function getLocalizedGenderLabel(translateText = defaultTranslate): Record<string, string> {
  return {
    MALE: translateText("Nam"),
    FEMALE: translateText("Nữ"),
    OTHER: translateText("Khác"),
  };
}

// Nhãn hiển thị tiếng Việt cho từng key field mà admin có thể đánh dấu
// là "cần sửa". Phải khớp với REJECTABLE_PROFILE_FIELDS ở backend.
function getLocalizedRejectedFieldLabel(translateText = defaultTranslate): Record<string, string> {
  return {
    first_name: translateText("Tên"),
    last_name: translateText("Họ và tên đệm"),
    phone_number: translateText("Số điện thoại"),
    gender: translateText("Giới tính"),
    birth_date: translateText("Ngày sinh"),
    bio: translateText("Giới thiệu"),
    experience_years: translateText("Số năm kinh nghiệm"),
    identity_number: translateText("Số CCCD/CMND"),
    service_id: translateText("Dịch vụ đăng ký"),
    portrait: translateText("Ảnh chân dung"),
    identity_front: translateText("Ảnh CCCD/CMND mặt trước"),
    identity_back: translateText("Ảnh CCCD/CMND mặt sau"),
    certificate_file: translateText("Chứng chỉ"),
  };
}

/** "1995-03-01" -> "01/03/1995" (không qua Date để tránh lệch múi giờ) */
function formatYmd(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (value ?? "");
}

/** ISO datetime -> "01/03/2026" */
function formatIsoDate(iso: string, translateText = defaultTranslate) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(getLocale(translateText), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getUpdateRoute(profile: WorkerProfileResponse) {
  if (profile.status === "REJECTED") {
    const steps = getRejectedSteps(profile.rejected_fields);
    if (steps.length > 0) return stepRoute(steps[0]);
  }
  return "/(profile-setup)/portrait";
}

function buildView(profile: WorkerProfileResponse, COLORS: ThemeColors, translateText = defaultTranslate) {
  const approvalWasRevoked =
    profile.status === "DRAFT" && !!profile.rejection_reason;
  const isFieldRejected = (field: string) =>
    (profile.status === "REJECTED" || approvalWasRevoked) && field in (profile.rejected_fields ?? {});

  const fieldNote = (field: string) =>
    isFieldRejected(field) ? (profile.rejected_fields[field] ?? "") : "";

  const buildImage = (
    raw: string | null | undefined,
    field: string,
  ): ProfileImage | null => {
    const uri = resolveMediaUrl(raw);
    if (!uri) return null;
    return {
      uri,
      rejected: isFieldRejected(field),
      note: fieldNote(field),
    };
  };

  const baseStatusInfo: ProfileStatusInfo = getProfileStatusInfo(COLORS, translateText)[profile.status] ?? {
    label: profile.status,
    color: COLORS.inkSoft,
    bg: COLORS.accentLight,
    text: COLORS.inkSoft,
  };
  const statusInfo = approvalWasRevoked
    ? { ...baseStatusInfo, label: translateText("Đã thu hồi phê duyệt") }
    : baseStatusInfo;

  const rejection =
    (profile.status === "REJECTED" || approvalWasRevoked) &&
    !!profile.rejection_reason
      ? {
          label: approvalWasRevoked
            ? translateText("Lý do thu hồi phê duyệt")
            : translateText("Lý do từ chối"),
          reason: profile.rejection_reason,
          fields: Object.entries(profile.rejected_fields ?? {}).map(
            ([key, note]) => ({
              key,
              label: getLocalizedRejectedFieldLabel(translateText)[key] ?? key,
              note,
            }),
          ),
        }
      : null;

  const missing =
    !profile.is_complete && profile.missing_fields.length > 0
      ? profile.missing_fields.map((f) => getLocalizedRejectedFieldLabel(translateText)[f] ?? f)
      : [];

  const personalRows: InfoRowData[] = [
    {
      label: translateText("Họ tên"),
      value: `${profile.last_name} ${profile.first_name}`.trim(),
    },
    { label: translateText("Số điện thoại"), value: profile.phone_number },
    { label: "Email", value: profile.email },
    {
      label: translateText("Giới tính"),
      value: getLocalizedGenderLabel(translateText)[profile.gender] ?? profile.gender,
    },
    { label: translateText("Ngày sinh"), value: formatYmd(profile.birth_date) },
    { label: translateText("Kinh nghiệm"), value: translateText("{{value0}} năm", { value0: profile.experience_years, count: profile.experience_years }) },
  ];

  const documentRows: InfoRowData[] = [
    { label: translateText("Số CCCD/CMND"), value: profile.identity_number },
    {
      label: translateText("Dịch vụ đăng ký"),
      value: profile.registered_service?.name ?? translateText("Chưa chọn"),
    },
  ];

  const approvalRows: InfoRowData[] | null =
    profile.status === "ACTIVE" && profile.approved_by
      ? [
          {
            label: translateText("Được duyệt bởi"),
            value:
              `${profile.approved_by.last_name} ${profile.approved_by.first_name}`.trim(),
          },
          {
            label: translateText("Ngày duyệt"),
            value: profile.approved_at
              ? formatIsoDate(profile.approved_at, translateText)
              : "—",
          },
        ]
      : null;

  return {
    statusInfo,
    completionPercent: profile.completion_percent,
    rejection,
    missing,
    portrait: {
      uri: resolveMediaUrl(profile.portrait),
      rejected: isFieldRejected("portrait"),
      note: fieldNote("portrait"),
    },
    personalRows,
    bio: profile.bio,
    documentRows,
    identityFront: buildImage(profile.identity_front, "identity_front"),
    identityBack: buildImage(profile.identity_back, "identity_back"),
    certificate: buildImage(profile.certificate_file, "certificate_file"),
    approvalRows,
    canUpdate: profile.status === "DRAFT" || profile.status === "REJECTED",
    updateLabel: approvalWasRevoked ? translateText("Cập nhật và gửi lại") : translateText("Cập nhật hồ sơ"),
  };
}

export type MyProfileView = ReturnType<typeof buildView>;

export function useMyProfile() {
  const { t: tr } = useTranslation();
  const { i18n } = useTranslation();
  const { COLORS } = useAppTheme();

  const { data: profile, isLoading } = useGetWorkerProfileQuery();

  const view = useMemo(() => (profile ? buildView(profile, COLORS, tr) : null), [profile, COLORS, i18n.resolvedLanguage]);

  const handleUpdate = () => {
    if (profile) router.push(getUpdateRoute(profile));
  };

  return {
    isLoading: isLoading || !profile,
    view,
    handleUpdate,
  };
}
