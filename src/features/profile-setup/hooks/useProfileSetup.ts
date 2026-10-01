import {
  useGetActiveServicesQuery,
  useGetWorkerProfileQuery,
  useGetWorkingAreasQuery,
  useSubmitWorkerProfileMutation,
  useUpdateWorkerProfileMutation,
  useUpdateWorkingAreasMutation,
} from "@/features/auth/api/authApi";
import { useAreaSelection } from "@/features/profile-setup/hooks/useAreaSelection";
import {
  patchDraft,
  resetDraft,
  type ProfileDraft,
} from "@/features/profile-setup/stores/profileDraftSlice";
import type { UpdateWorkerProfileRequest } from "@/features/profile-setup/types/WorkerProfile";
import {
  fieldRejectionNote,
  getNextRejectedStep,
  getRejectedSteps,
  isFieldLocked,
  stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import type { AppDispatch, RootState } from "@/store/store";
import { getErrorMessage } from "@/utils/apiError";
import { resolveMediaUrl } from "@/utils/media";
import { showErrorToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export type SetupStep =
  | "portrait"
  | "identity"
  | "service"
  | "area"
  | "experience";

type Route = ReturnType<typeof stepRoute> | "/(profile-setup)/area";
type RejectedStep = ReturnType<typeof getRejectedSteps>[number];

export const SETUP_STEPS: SetupStep[] = [
  "portrait",
  "identity",
  "service",
  "area",
  "experience",
];
export const STEP_NUMBER: Record<SetupStep, number> = {
  portrait: 1,
  identity: 2,
  service: 3,
  area: 4,
  experience: 5,
};

const ROUTES: Record<SetupStep, Route> = {
  portrait: "/(profile-setup)/portrait",
  identity: "/(profile-setup)/identity",
  service: "/(profile-setup)/service",
  area: "/(profile-setup)/area",
  experience: "/(profile-setup)/experience",
};
const NEXT: Record<SetupStep, Route | null> = {
  portrait: ROUTES.identity,
  identity: ROUTES.service,
  service: ROUTES.area,
  area: ROUTES.experience,
  experience: null,
};
const SUCCESS_ROUTE = "/(profile-setup)/success" as const;

// CCCD 12 số (chuẩn mới từ 2021) hoặc CMND 9 số (giấy tờ cũ vẫn còn hiệu lực)
const IDENTITY_NUMBER_REGEX = /^(\d{12}|\d{9})$/;
const MAX_EXPERIENCE_YEARS = 60;

// Tên hiển thị tuỳ chỉnh cho nhóm dịch vụ gồm nhiều service cùng làm được.
const SECTION_DISPLAY_NAME: Record<string, string> = {
  HOME_CLEANING: "Dọn dẹp nhà (ca lẻ & định kỳ)",
};

export function useProfileSetup() {
  const dispatch = useDispatch<AppDispatch>();
  const draft = useSelector((s: RootState) => s.profileDraft);

  const profileQuery = useGetWorkerProfileQuery();
  const servicesQuery = useGetActiveServicesQuery();
  const workingQuery = useGetWorkingAreasQuery();

  const [updateProfile] = useUpdateWorkerProfileMutation();
  const [updateAreas] = useUpdateWorkingAreasMutation();
  const [submitProfile] = useSubmitWorkerProfileMutation();

  const profile = profileQuery.data;
  const userId = profile?.user_id ?? null;

  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const workingRef = useRef(false);
  const [serviceSearch, setServiceSearch] = useState("");

  // Nháp của tài khoản khác (đăng xuất rồi đăng nhập lại) thì xóa.
  useEffect(() => {
    if (userId !== null && draft.userId !== userId) {
      dispatch(resetDraft(userId));
    }
  }, [userId, draft.userId, dispatch]);

  const update = (patch: Partial<Omit<ProfileDraft, "userId">>) => {
    dispatch(patchDraft(patch));
    if (error) setError("");
  };

  // ---------- Rejection ----------
  const isRejected = profile?.status === "REJECTED";
  const note = (field: string) =>
    profile ? fieldRejectionNote(profile, field) : null;
  const locked = (field: string) => isFieldLocked(profile, field);

  const imagesLocked = locked("identity_front") && locked("identity_back");
  const hasImageRejection =
    !imagesLocked && (!!note("identity_front") || !!note("identity_back"));

  // ---------- Giá trị hiện tại = nháp ?? server ----------
  const existing = {
    portrait: resolveMediaUrl(profile?.portrait),
    identityFront: resolveMediaUrl(profile?.identity_front),
    identityBack: resolveMediaUrl(profile?.identity_back),
    certificate: resolveMediaUrl(profile?.certificate_file),
  };
  const identityNumber = draft.identityNumber ?? profile?.identity_number ?? "";
  const bio = draft.bio ?? profile?.bio ?? "";
  const experienceYears =
    draft.experienceYears ??
    (profile?.experience_years != null ? String(profile.experience_years) : "");
  const serviceId = draft.serviceId ?? profile?.registered_service?.id ?? null;
  const areaIds =
    draft.areaIds ?? (workingQuery.data ?? []).map((w) => w.area.id);
  const areaSet = new Set(areaIds);
  const provinceCode =
    draft.provinceCode ?? workingQuery.data?.[0]?.area.province_code ?? null;

  const area = useAreaSelection({
    provinceCode,
    areaIds,
    onChange: (next) =>
      update({ provinceCode: next.provinceCode, areaIds: next.areaIds }),
  });

  // ---------- Danh sách dịch vụ / khu vực ----------
  const serviceGroups = useMemo(() => {
    const services = servicesQuery.data;
    if (!services) return [];
    const keyword = serviceSearch.trim().toLowerCase();
    const filtered = keyword
      ? services.filter((s) => s.name.toLowerCase().includes(keyword))
      : services;

    const bySection = new Map<string, typeof services>();
    for (const s of filtered) {
      if (!bySection.has(s.section_code)) bySection.set(s.section_code, []);
      bySection.get(s.section_code)!.push(s);
    }

    return Array.from(bySection.entries()).map(([sectionCode, list]) => {
      const sorted = [...list].sort((a, b) => a.id - b.id);
      const rep = sorted[0];
      return {
        sectionCode,
        representativeId: rep.id,
        memberIds: sorted.map((s) => s.id),
        name: SECTION_DISPLAY_NAME[sectionCode] ?? rep.name,
        description: rep.description,
        image: rep.primary_image,
      };
    });
  }, [servicesQuery.data, serviceSearch]);

  const selectService = (representativeId: number) =>
    update({ serviceId: representativeId });

  // ---------- Kiểm tra từng bước ----------
  const validate = (step: SetupStep): string | null => {
    switch (step) {
      case "portrait":
        if (note("portrait") && !draft.portrait) {
          return "Vui lòng chọn ảnh mới theo yêu cầu của quản trị viên.";
        }
        if (!draft.portrait && !existing.portrait) {
          return "Vui lòng chọn ảnh chân dung.";
        }
        return null;

      case "identity": {
        const n = identityNumber.trim();
        if (!locked("identity_number")) {
          if (!n) return "Vui lòng nhập số CCCD/CMND.";
          if (!IDENTITY_NUMBER_REGEX.test(n)) {
            return "Số CCCD/CMND không hợp lệ (phải gồm 9 hoặc 12 chữ số).";
          }
        }
        if (!imagesLocked) {
          const f = draft.identityFront;
          const b = draft.identityBack;
          if (hasImageRejection && (!f || !b)) {
            return "Vui lòng tải lại cả 2 mặt ảnh CCCD/CMND (mặt trước và mặt sau).";
          }
          if (
            (!f && !existing.identityFront) ||
            (!b && !existing.identityBack)
          ) {
            return "Vui lòng tải lên đủ ảnh mặt trước và mặt sau.";
          }
          if ((f && !b) || (!f && b)) {
            return "Vui lòng chọn cả mặt trước và mặt sau để cập nhật ảnh.";
          }
        }
        return null;
      }

      case "service":
        return serviceId
          ? null
          : "Vui lòng chọn loại dịch vụ bạn muốn đăng ký.";

      case "area":
        return areaIds.length > 0
          ? null
          : "Vui lòng chọn ít nhất một khu vực hoạt động.";

      case "experience": {
        const years = Number(experienceYears);
        if (!locked("bio") && !bio.trim()) {
          return "Vui lòng giới thiệu đôi nét về bản thân.";
        }
        if (
          !locked("experience_years") &&
          (experienceYears === "" ||
            Number.isNaN(years) ||
            years < 0 ||
            years > MAX_EXPERIENCE_YEARS)
        ) {
          return "Số năm kinh nghiệm không hợp lệ.";
        }
        if (
          !locked("certificate_file") &&
          note("certificate_file") &&
          !draft.certificate
        ) {
          return "Vui lòng tải lại chứng chỉ theo yêu cầu của quản trị viên.";
        }
        if (!draft.certificate && !existing.certificate) {
          return "Vui lòng tải lên chứng chỉ/bằng cấp liên quan.";
        }
        return null;
      }
    }
  };

  // ---------- Điều hướng ----------
  const nextTarget = (step: SetupStep): Route | "submit" => {
    if (isRejected) {
      const n = getNextRejectedStep(
        profile?.rejected_fields,
        step === "area" ? "service" : step,
      );
      return n ? stepRoute(n) : "submit";
    }
    return NEXT[step] ?? "submit";
  };

  const isFinalStep = (step: SetupStep) => nextTarget(step) === "submit";

  const ctaLabel = (step: SetupStep) => {
    if (!isFinalStep(step)) return "Tiếp tục";
    return isRejected ? "Hoàn tất & gửi lại" : "Gửi hồ sơ";
  };

  // ---------- Gửi dữ liệu (chỉ field đang mở) ----------
  const buildFields = (): UpdateWorkerProfileRequest => {
    const f: UpdateWorkerProfileRequest = {};
    if (!locked("identity_number") && identityNumber.trim()) {
      f.identity_number = identityNumber.trim();
    }
    if (!imagesLocked && draft.identityFront && draft.identityBack) {
      f.identity_front = draft.identityFront;
      f.identity_back = draft.identityBack;
    }
    if (!locked("portrait") && draft.portrait) f.portrait = draft.portrait;
    if (!locked("service_id") && serviceId !== null) f.service_id = serviceId;
    if (!locked("bio") && bio.trim()) f.bio = bio.trim();
    if (!locked("experience_years") && experienceYears !== "") {
      f.experience_years = Number(experienceYears);
    }
    if (!locked("certificate_file") && draft.certificate) {
      f.certificate_file = draft.certificate;
    }
    return f;
  };

  const saveProfileFields = async () => {
    const fields = buildFields();
    if (Object.keys(fields).length > 0) {
      await updateProfile(fields).unwrap();
    }
  };

  const run = async (task: () => Promise<void>, failTitle: string) => {
    if (workingRef.current) return false;
    workingRef.current = true;
    setWorking(true);
    try {
      await task();
      return true;
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      showErrorToast(failTitle, message);
      workingRef.current = false;
      setWorking(false);
      return false;
    }
  };

  const release = () => {
    workingRef.current = false;
    setWorking(false);
  };

  const submit = async () => {
    if (profile?.status === "PENDING") {
      router.replace(SUCCESS_ROUTE);
      return;
    }

    const steps: SetupStep[] = isRejected
      ? getRejectedSteps(profile?.rejected_fields).filter(
          (s): s is Exclude<RejectedStep, "personal-info"> =>
            s !== "personal-info",
        )
      : SETUP_STEPS;
    for (const s of steps) {
      const message = validate(s);
      if (message) {
        showErrorToast("Thiếu thông tin", message);
        router.push(ROUTES[s]);
        return;
      }
    }

    const ok = await run(async () => {
      await saveProfileFields();
      if (!isRejected) await updateAreas(areaIds).unwrap();
      await submitProfile().unwrap();
      dispatch(resetDraft(userId));
      router.replace(SUCCESS_ROUTE);
    }, "Gửi hồ sơ thất bại");
    // Thành công: giữ khóa cho tới khi rời màn hình.
    if (!ok) return;
  };

  const goNext = async (step: SetupStep) => {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");

    const target = nextTarget(step);
    if (target === "submit") {
      await submit();
      return;
    }

    // Bước sửa lỗi kế tiếp là màn "thông tin cá nhân" (có luồng gửi riêng):
    // lưu dữ liệu nháp lên server trước để không bị mất.
    if (isRejected && target === stepRoute("personal-info")) {
      const ok = await run(saveProfileFields, "Lưu hồ sơ thất bại");
      if (!ok) return;
      release();
    }
    router.push(target);
  };

  return {
    profile,
    isLoading: profileQuery.isLoading || servicesQuery.isLoading,
    isLoadingProfile: profileQuery.isLoading,
    isBusy: working,
    error,

    // luồng
    isRejected,
    isFinalStep,
    ctaLabel,
    goNext,

    // trạng thái bị từ chối
    note,
    locked,
    imagesLocked,
    hasImageRejection,

    // dữ liệu
    draft,
    existing,
    identityNumber,
    bio,
    experienceYears,
    serviceId,
    areaIds,
    update,

    // dịch vụ / khu vực
    serviceGroups,
    serviceSearch,
    setServiceSearch,
    selectService,
    area,
  };
}

export type ProfileSetup = ReturnType<typeof useProfileSetup>;
