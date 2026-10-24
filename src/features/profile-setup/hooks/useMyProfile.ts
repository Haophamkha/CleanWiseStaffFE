import { translate as tr, getLocale } from "@/features/language/i18n";
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

function getLocalizedGenderLabel(): Record<string, string> {
  return {
    MALE: tr("Nam"),
    FEMALE: tr("Nữ"),
    OTHER: tr("Khác"),
  };
}

// Nhãn hiển thị tiếng Việt cho từng key field mà admin có thể đánh dấu
// là "cần sửa". Phải khớp với REJECTABLE_PROFILE_FIELDS ở backend.
function getLocalizedRejectedFieldLabel(): Record<string, string> {
  return {
    first_name: tr("Tên"),
    last_name: tr("Họ và tên đệm"),
    phone_number: tr("Số điện thoại"),
    gender: tr("Giới tính"),
    birth_date: tr("Ngày sinh"),
    bio: tr("Giới thiệu"),
    experience_years: tr("Số năm kinh nghiệm"),
    identity_number: tr("Số CCCD/CMND"),
    service_id: tr("Dịch vụ đăng ký"),
    portrait: tr("Ảnh chân dung"),
    identity_front: tr("Ảnh CCCD/CMND mặt trước"),
    identity_back: tr("Ảnh CCCD/CMND mặt sau"),
    certificate_file: tr("Chứng chỉ"),
  };
}

/** "1995-03-01" -> "01/03/1995" (không qua Date để tránh lệch múi giờ) */
function formatYmd(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (value ?? "");
}

/** ISO datetime -> "01/03/2026" */
function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(getLocale(), {
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

function buildView(profile: WorkerProfileResponse, COLORS: ThemeColors) {
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

  const baseStatusInfo: ProfileStatusInfo = getProfileStatusInfo(COLORS)[profile.status] ?? {
    label: profile.status,
    color: COLORS.inkSoft,
    bg: COLORS.accentLight,
    text: COLORS.inkSoft,
  };
  const statusInfo = approvalWasRevoked
    ? { ...baseStatusInfo, label: tr("Đã thu hồi phê duyệt") }
    : baseStatusInfo;

  const rejection =
    (profile.status === "REJECTED" || approvalWasRevoked) &&
    !!profile.rejection_reason
      ? {
          label: approvalWasRevoked
            ? tr("Lý do thu hồi phê duyệt")
            : tr("Lý do từ chối"),
          reason: profile.rejection_reason,
          fields: Object.entries(profile.rejected_fields ?? {}).map(
            ([key, note]) => ({
              key,
              label: getLocalizedRejectedFieldLabel()[key] ?? key,
              note,
            }),
          ),
        }
      : null;

  const missing =
    !profile.is_complete && profile.missing_fields.length > 0
      ? profile.missing_fields.map((f) => getLocalizedRejectedFieldLabel()[f] ?? f)
      : [];

  const personalRows: InfoRowData[] = [
    {
      label: tr("Họ tên"),
      value: `${profile.last_name} ${profile.first_name}`.trim(),
    },
    { label: tr("Số điện thoại"), value: profile.phone_number },
    { label: "Email", value: profile.email },
    {
      label: tr("Giới tính"),
      value: getLocalizedGenderLabel()[profile.gender] ?? profile.gender,
    },
    { label: tr("Ngày sinh"), value: formatYmd(profile.birth_date) },
    { label: tr("Kinh nghiệm"), value: tr("{{value0}} năm", { value0: profile.experience_years, count: profile.experience_years }) },
  ];

  const documentRows: InfoRowData[] = [
    { label: tr("Số CCCD/CMND"), value: profile.identity_number },
    {
      label: tr("Dịch vụ đăng ký"),
      value: profile.registered_service?.name ?? tr("Chưa chọn"),
    },
  ];

  const approvalRows: InfoRowData[] | null =
    profile.status === "ACTIVE" && profile.approved_by
      ? [
          {
            label: tr("Được duyệt bởi"),
            value:
              `${profile.approved_by.last_name} ${profile.approved_by.first_name}`.trim(),
          },
          {
            label: tr("Ngày duyệt"),
            value: profile.approved_at
              ? formatIsoDate(profile.approved_at)
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
    updateLabel: approvalWasRevoked ? tr("Cập nhật và gửi lại") : tr("Cập nhật hồ sơ"),
  };
}

export type MyProfileView = ReturnType<typeof buildView>;

export function useMyProfile() {
  const { i18n } = useTranslation();
  const { COLORS } = useAppTheme();

  const { data: profile, isLoading } = useGetWorkerProfileQuery();

  const view = useMemo(() => (profile ? buildView(profile, COLORS) : null), [profile, COLORS, i18n.resolvedLanguage]);

  const handleUpdate = () => {
    if (profile) router.push(getUpdateRoute(profile));
  };

  return {
    isLoading: isLoading || !profile,
    view,
    handleUpdate,
  };
}
