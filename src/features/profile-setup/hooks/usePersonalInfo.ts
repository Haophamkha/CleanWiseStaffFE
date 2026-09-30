import {
    useGetWorkerProfileQuery,
    useSubmitWorkerProfileMutation,
    useUpdateWorkerProfileMutation,
} from "@/features/auth/api/authApi";
import type { Gender } from "@/features/profile-setup/types/WorkerProfile";
import {
    fieldRejectionNote,
    getNextRejectedStep,
    isFieldLocked,
    stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const MAX_BIRTH_DATE = new Date(
  new Date().setFullYear(new Date().getFullYear() - 18),
);

/** Ảnh chụp giá trị form lúc nạp từ profile, dùng để biết người dùng đã sửa gì chưa. */
type FormSnapshot = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: Gender | null;
  birthDate: string;
  bio: string;
  experienceYears: string;
};

export function usePersonalInfo() {
  const { data: profile, isLoading: isLoadingProfile } =
    useGetWorkerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateWorkerProfileMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [initial, setInitial] = useState<FormSnapshot | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const isRejectedFlow = profile?.status === "REJECTED";
  const firstNameNote = profile
    ? fieldRejectionNote(profile, "first_name")
    : null;
  const lastNameNote = profile
    ? fieldRejectionNote(profile, "last_name")
    : null;
  const phoneNote = profile
    ? fieldRejectionNote(profile, "phone_number")
    : null;
  const genderNote = profile ? fieldRejectionNote(profile, "gender") : null;
  const birthDateNote = profile
    ? fieldRejectionNote(profile, "birth_date")
    : null;
  const nextRejectedStep = isRejectedFlow
    ? getNextRejectedStep(profile?.rejected_fields, "personal-info")
    : null;
  const isBusy = isSaving || isSubmitting;

  const firstNameLocked = isFieldLocked(profile, "first_name");
  const lastNameLocked = isFieldLocked(profile, "last_name");
  const phoneLocked = isFieldLocked(profile, "phone_number");
  const genderLocked = isFieldLocked(profile, "gender");
  const birthLocked = isFieldLocked(profile, "birth_date");
  const bioLocked = isFieldLocked(profile, "bio");
  const yearsLocked = isFieldLocked(profile, "experience_years");

  useEffect(() => {
    if (profile && !prefilled) {
      const snapshot: FormSnapshot = {
        firstName: profile.last_name ?? "",
        lastName: profile.first_name ?? "",
        phoneNumber: profile.phone_number ?? "",
        gender: profile.gender ?? null,
        birthDate: profile.birth_date ?? "",
        bio: profile.bio ?? "",
        experienceYears:
          profile.experience_years != null
            ? String(profile.experience_years)
            : "",
      };
      setFirstName(snapshot.firstName);
      setLastName(snapshot.lastName);
      setPhoneNumber(snapshot.phoneNumber);
      setGender(snapshot.gender);
      setBirthDate(snapshot.birthDate);
      setBio(snapshot.bio);
      setExperienceYears(snapshot.experienceYears);
      setInitial(snapshot);
      setPrefilled(true);
    }
  }, [profile, prefilled]);

  // Đã sửa so với dữ liệu ban đầu hay chưa (chữ so sánh sau khi trim)
  const isDirty =
    initial !== null &&
    (firstName.trim() !== initial.firstName.trim() ||
      lastName.trim() !== initial.lastName.trim() ||
      phoneNumber.trim() !== initial.phoneNumber.trim() ||
      gender !== initial.gender ||
      birthDate !== initial.birthDate ||
      bio.trim() !== initial.bio.trim() ||
      experienceYears !== initial.experienceYears);

  // Luồng bị từ chối: nút "Tiếp tục" / "Hoàn tất & gửi lại" luôn bấm được
  // (có thể không cần sửa trường nào ở bước này). Chỉ luồng thường mới cần dirty + confirm.
  const requiresConfirm = !isRejectedFlow;
  const canSubmit = isRejectedFlow ? true : isDirty;

  const handleChangeYears = (text: string) =>
    setExperienceYears(text.replace(/[^0-9]/g, ""));

  const handleSave = async () => {
    if (
      (!firstNameLocked && !firstName.trim()) ||
      (!lastNameLocked && !lastName.trim()) ||
      (!phoneLocked && !phoneNumber.trim())
    ) {
      setError("Vui lòng điền đầy đủ họ tên và số điện thoại.");
      return;
    }
    setError("");
    try {
      // Chỉ gửi những field đang mở
      await updateProfile({
        ...(!firstNameLocked && { first_name: firstName.trim() }),
        ...(!lastNameLocked && { last_name: lastName.trim() }),
        ...(!phoneLocked && { phone_number: phoneNumber.trim() }),
        ...(!genderLocked && gender && { gender }),
        ...(!birthLocked && birthDate && { birth_date: birthDate }),
        ...(!bioLocked && { bio: bio.trim() }),
        ...(!yearsLocked &&
          experienceYears !== "" && {
            experience_years: Math.max(0, Number(experienceYears)),
          }),
      }).unwrap();

      if (isRejectedFlow) {
        if (nextRejectedStep) {
          router.push(stepRoute(nextRejectedStep));
        } else {
          await submitProfile().unwrap();
          router.replace("/(profile-setup)/success");
        }
        return;
      }

      showSuccessToast("Thành công", "Đã cập nhật thông tin cá nhân.");
      router.back();
    } catch (e: any) {
      const message =
        e?.data?.message || "Cập nhật thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  /** Nút dưới cùng: luồng thường thì hỏi xác nhận trước, luồng bị từ chối thì lưu luôn. */
  const handlePressSave = () => {
    if (requiresConfirm) {
      setConfirmVisible(true);
      return;
    }
    handleSave();
  };

  const handleConfirmSave = () => {
    setConfirmVisible(false);
    handleSave();
  };

  const handleCancelConfirm = () => setConfirmVisible(false);

  const submitLabel =
    isRejectedFlow && nextRejectedStep
      ? "Tiếp tục"
      : isRejectedFlow
        ? "Hoàn tất & gửi lại"
        : "Lưu thay đổi";

  return {
    isLoadingProfile,
    isBusy,
    error,
    submitLabel,
    maxBirthDate: MAX_BIRTH_DATE,
    values: {
      firstName,
      lastName,
      phoneNumber,
      gender,
      birthDate,
      bio,
      experienceYears,
    },
    setFirstName,
    setLastName,
    setPhoneNumber,
    setGender,
    setBirthDate,
    setBio,
    handleChangeYears,
    locked: {
      firstName: firstNameLocked,
      lastName: lastNameLocked,
      phone: phoneLocked,
      gender: genderLocked,
      birth: birthLocked,
      bio: bioLocked,
      years: yearsLocked,
    },
    notes: {
      firstName: firstNameNote,
      lastName: lastNameNote,
      phone: phoneNote,
      gender: genderNote,
      birthDate: birthDateNote,
    },
    handleSave,
    isDirty,
    canSubmit,
    confirmVisible,
    handlePressSave,
    handleConfirmSave,
    handleCancelConfirm,
  };
}

export type PersonalInfoState = ReturnType<typeof usePersonalInfo>;
