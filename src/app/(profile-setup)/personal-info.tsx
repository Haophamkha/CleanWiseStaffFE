import { DateInputBox } from "@/components/profile-setup/DateInputBox";
import { SimpleHeader } from "@/components/profile-setup/SimpleHeader";
import {
  useGetWorkerProfileQuery,
  useSubmitWorkerProfileMutation,
  useUpdateWorkerProfileMutation,
} from "@/services/authApi";
import type { Gender } from "@/types/WorkerProfile";
import {
  fieldRejectionNote,
  getNextRejectedStep,
  isFieldLocked,
  stepRoute,
} from "@/utils/rejectionFlow";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const MAX_BIRTH_DATE = new Date(
  new Date().setFullYear(new Date().getFullYear() - 18),
);

export default function PersonalInfoStep() {
  const insets = useSafeAreaInsets();
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
      setFirstName(profile.last_name ?? "");
      setLastName(profile.first_name ?? "");
      setPhoneNumber(profile.phone_number ?? "");
      setGender(profile.gender ?? null);
      setBirthDate(profile.birth_date ?? "");
      setBio(profile.bio ?? "");
      setExperienceYears(
        profile.experience_years != null
          ? String(profile.experience_years)
          : "",
      );
      setPrefilled(true);
    }
  }, [profile, prefilled]);

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

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-[#F8F9FC]">
        <SimpleHeader title="Thông tin cá nhân" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <SimpleHeader title="Thông tin cá nhân" />
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-[#111827] text-sm mb-2">Họ</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            lastNameLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <TextInput
            className={`flex-1 text-[15px] ${
              lastNameLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Nguyễn"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            editable={!lastNameLocked}
          />
          {lastNameLocked && <Feather name="lock" size={15} color="#9CA3AF" />}
        </View>
        {!!lastNameNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{lastNameNote}</Text>
        )}
        {!lastNameNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Tên</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            firstNameLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <TextInput
            className={`flex-1 text-[15px] ${
              firstNameLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Văn A"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            editable={!firstNameLocked}
          />
          {firstNameLocked && <Feather name="lock" size={15} color="#9CA3AF" />}
        </View>
        {!!firstNameNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{firstNameNote}</Text>
        )}
        {!firstNameNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Số điện thoại</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            phoneLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <Feather name="phone" size={17} color="#9CA3AF" />
          <TextInput
            className={`flex-1 ml-3 text-[15px] ${
              phoneLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="09xxxxxxxx"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!phoneLocked}
          />
          {phoneLocked && <Feather name="lock" size={15} color="#9CA3AF" />}
        </View>
        {!!phoneNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{phoneNote}</Text>
        )}
        {!phoneNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Giới tính</Text>
        <View className="flex-row gap-2 mb-1">
          {GENDER_OPTIONS.map((opt) => {
            const isSelected = gender === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setGender(opt.value)}
                disabled={genderLocked}
                style={{ opacity: genderLocked ? 0.5 : 1 }}
                className={`flex-1 rounded-2xl py-3 items-center border ${
                  isSelected
                    ? "border-[#2563EB] bg-[#EEF2FF]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <Text
                  className={`text-[14px] ${
                    isSelected
                      ? "text-[#2563EB] font-semibold"
                      : "text-[#374151]"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!genderNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{genderNote}</Text>
        )}
        {!genderNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Ngày sinh</Text>
        <DateInputBox
          value={birthDate}
          onChange={setBirthDate}
          maxDate={MAX_BIRTH_DATE}
          disabled={birthLocked}
        />
        {!!birthDateNote && (
          <Text className="text-[#DC2626] text-xs mb-3 -mt-3">
            {birthDateNote}
          </Text>
        )}

        <Text className="text-[#111827] text-sm mb-2">Số năm kinh nghiệm</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-4 ${
            yearsLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <TextInput
            className={`flex-1 text-[15px] ${
              yearsLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={experienceYears}
            editable={!yearsLocked}
            onChangeText={(text) =>
              setExperienceYears(text.replace(/[^0-9]/g, ""))
            }
          />
          {yearsLocked && <Feather name="lock" size={15} color="#9CA3AF" />}
        </View>

        <Text className="text-[#111827] text-sm mb-2">Giới thiệu bản thân</Text>
        <View
          className={`border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-4 ${
            bioLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <TextInput
            className={`text-[15px] ${
              bioLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Mô tả kinh nghiệm, kỹ năng của bạn..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: "top" }}
            value={bio}
            onChangeText={setBio}
            editable={!bioLocked}
          />
        </View>

        {!!error && (
          <Text className="text-[#DC2626] text-sm mb-2">{error}</Text>
        )}
      </ScrollView>

      <View
        className="px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className="bg-[#2563EB] rounded-2xl py-4 items-center"
          onPress={handleSave}
          disabled={isBusy}
        >
          <Text className="text-white font-semibold text-[15px]">
            {isBusy
              ? "Đang xử lý..."
              : isRejectedFlow && nextRejectedStep
                ? "Tiếp tục"
                : isRejectedFlow
                  ? "Hoàn tất & gửi lại"
                  : "Lưu thay đổi"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
