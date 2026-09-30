import { COLORS } from "@/constants/theme";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import type { WorkerProfileResponse } from "@/features/profile-setup/types/WorkerProfile";
import {
    getRejectedSteps,
    stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import {
    STATUS_INFO,
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

const GENDER_LABEL: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

// Nhãn hiển thị tiếng Việt cho từng key field mà admin có thể đánh dấu
// là "cần sửa". Phải khớp với REJECTABLE_PROFILE_FIELDS ở backend.
const REJECTED_FIELD_LABEL: Record<string, string> = {
  first_name: "Tên",
  last_name: "Họ và tên đệm",
  phone_number: "Số điện thoại",
  gender: "Giới tính",
  birth_date: "Ngày sinh",
  bio: "Giới thiệu",
  experience_years: "Số năm kinh nghiệm",
  identity_number: "Số CCCD/CMND",
  service_id: "Dịch vụ đăng ký",
  portrait: "Ảnh chân dung",
  identity_front: "Ảnh CCCD/CMND mặt trước",
  identity_back: "Ảnh CCCD/CMND mặt sau",
  certificate_file: "Chứng chỉ",
};

/** "1995-03-01" -> "01/03/1995" (không qua Date để tránh lệch múi giờ) */
function formatYmd(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (value ?? "");
}

/** ISO datetime -> "01/03/2026" */
function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", {
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

function buildView(profile: WorkerProfileResponse) {
  const isFieldRejected = (field: string) =>
    profile.status === "REJECTED" && field in (profile.rejected_fields ?? {});

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

  const statusInfo: ProfileStatusInfo = STATUS_INFO[profile.status] ?? {
    label: profile.status,
    color: COLORS.inkSoft,
    bg: COLORS.accentLight,
    text: COLORS.inkSoft,
  };

  const rejection =
    profile.status === "REJECTED" && !!profile.rejection_reason
      ? {
          reason: profile.rejection_reason,
          fields: Object.entries(profile.rejected_fields ?? {}).map(
            ([key, note]) => ({
              key,
              label: REJECTED_FIELD_LABEL[key] ?? key,
              note,
            }),
          ),
        }
      : null;

  const missing =
    !profile.is_complete && profile.missing_fields.length > 0
      ? profile.missing_fields.map((f) => REJECTED_FIELD_LABEL[f] ?? f)
      : [];

  const personalRows: InfoRowData[] = [
    {
      label: "Họ tên",
      value: `${profile.last_name} ${profile.first_name}`.trim(),
    },
    { label: "Số điện thoại", value: profile.phone_number },
    { label: "Email", value: profile.email },
    {
      label: "Giới tính",
      value: GENDER_LABEL[profile.gender] ?? profile.gender,
    },
    { label: "Ngày sinh", value: formatYmd(profile.birth_date) },
    { label: "Kinh nghiệm", value: `${profile.experience_years} năm` },
  ];

  const documentRows: InfoRowData[] = [
    { label: "Số CCCD/CMND", value: profile.identity_number },
    {
      label: "Dịch vụ đăng ký",
      value: profile.registered_service?.name ?? "Chưa chọn",
    },
  ];

  const approvalRows: InfoRowData[] | null =
    profile.status === "ACTIVE" && profile.approved_by
      ? [
          {
            label: "Được duyệt bởi",
            value:
              `${profile.approved_by.last_name} ${profile.approved_by.first_name}`.trim(),
          },
          {
            label: "Ngày duyệt",
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
  };
}

export type MyProfileView = ReturnType<typeof buildView>;

export function useMyProfile() {
  const { data: profile, isLoading } = useGetWorkerProfileQuery();

  const view = useMemo(() => (profile ? buildView(profile) : null), [profile]);

  const handleUpdate = () => {
    if (profile) router.push(getUpdateRoute(profile));
  };

  return {
    isLoading: isLoading || !profile,
    view,
    handleUpdate,
  };
}
