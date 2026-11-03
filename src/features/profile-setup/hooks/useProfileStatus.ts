import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useGetWorkingAreasQuery } from "@/features/auth/api/authApi";
import type {
    ProfileStatus,
    WorkerProfileResponse,
} from "@/features/profile-setup/types/WorkerProfile";
import {
    getRejectedSteps,
    stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import { router } from "expo-router";

export type StatusTone = "danger" | "warning";
type StatusRoute = "wizard" | "review" | null;

type StatusConfig = {
  title: string;
  description: string;
  badge: string;
  tone: StatusTone;
  ctaLabel: string | null;
  ctaRoute: StatusRoute;
};

function getLocalizedStatusConfig(translateText = defaultTranslate): Record<ProfileStatus, StatusConfig> {
  return {
    DRAFT: {
      title: translateText("Hoàn thiện hồ sơ để bắt đầu nhận việc"),
      description:
        translateText("Bạn cần cập nhật ảnh chân dung, CCCD, dịch vụ, khu vực hoạt động và kinh nghiệm."),
      badge: translateText("Chưa hoàn tất"),
      tone: "danger",
      ctaLabel: translateText("Cập nhật"),
      ctaRoute: "wizard",
    },
    REJECTED: {
      title: translateText("Hồ sơ bị từ chối, vui lòng cập nhật lại"),
      description:
        translateText("Vui lòng kiểm tra và chỉnh sửa thông tin theo phản hồi của quản trị viên."),
      badge: translateText("Bị từ chối"),
      tone: "danger",
      ctaLabel: translateText("Cập nhật"),
      ctaRoute: "wizard",
    },
    PENDING: {
      title: translateText("Hồ sơ đang chờ xét duyệt"),
      description: translateText("Quản trị viên sẽ phản hồi trong vòng 24 - 48 giờ."),
      badge: translateText("Chờ duyệt"),
      tone: "warning",
      ctaLabel: translateText("Xem lại hồ sơ"),
      ctaRoute: "review",
    },
    ACTIVE: {
      title: "",
      description: "",
      badge: "",
      tone: "danger",
      ctaLabel: null,
      ctaRoute: null,
    },
    SUSPENDED: {
      title: translateText("Tài khoản đang bị tạm khóa"),
      description: translateText("Vui lòng liên hệ quản trị viên để biết thêm chi tiết."),
      badge: translateText("Tạm khóa"),
      tone: "danger",
      ctaLabel: null,
      ctaRoute: null,
    },
  };
}

const TOTAL_STEPS = 5;

export function useProfileStatus(profile: WorkerProfileResponse) {
  const { t: tr } = useTranslation();

  const { status } = profile;

  // Chỉ fetch khu vực khi hồ sơ chưa ACTIVE
  const { data: workingAreas } = useGetWorkingAreasQuery(undefined, {
    skip: status === "ACTIVE",
  });

  const approvalWasRevoked = status === "DRAFT" && !!profile.rejection_reason;
  const config: StatusConfig = approvalWasRevoked
    ? {
        ...getLocalizedStatusConfig(tr).DRAFT,
        title: tr("Phê duyệt hồ sơ đã được thu hồi"),
        description:
          tr("Vui lòng cập nhật hồ sơ nếu cần và gửi lại để quản trị viên xét duyệt."),
        badge: tr("Đã thu hồi phê duyệt"),
        ctaLabel: tr("Cập nhật và gửi lại"),
      }
    : getLocalizedStatusConfig(tr)[status];

  const stepsDone = [
    // Step 1: Ảnh chân dung
    !!profile.portrait,

    // Step 2: CCCD
    !!profile.identity_number &&
      !!profile.identity_front &&
      !!profile.identity_back,

    // Step 3: Dịch vụ
    !!profile.registered_service,

    // Step 4: Khu vực hoạt động
    !!workingAreas && workingAreas.length > 0,

    // Step 5: Kinh nghiệm
    !!profile.bio &&
      profile.experience_years !== null &&
      profile.experience_years !== undefined &&
      !!profile.certificate_file,
  ].filter(Boolean).length;

  const completionPercent = Math.round((stepsDone / TOTAL_STEPS) * 100);

  const handlePressCta = () => {
    if (config.ctaRoute === "wizard") {
      if (status === "REJECTED") {
        const steps = getRejectedSteps(profile.rejected_fields);
        if (steps.length > 0) {
          router.push(stepRoute(steps[0]));
          return;
        }
      }
      router.push("/(profile-setup)/portrait");
    } else if (config.ctaRoute === "review") {
      router.push("/(profile-setup)/my-profile");
    }
  };

  return {
    status,
    approvalWasRevoked,
    isActive: status === "ACTIVE",
    config,
    stepsDone,
    totalSteps: TOTAL_STEPS,
    completionPercent,
    handlePressCta,
  };
}
