import { ImageUploadBox } from "@/components/profile-setup/ImageUploadBox";
import { StepHeader } from "@/components/profile-setup/StepHeader";
import {
    useGetWorkerProfileQuery,
    useSubmitWorkerProfileMutation,
    useUpdateWorkerProfileMutation,
} from "@/services/authApi";
import type { PickedFile } from "@/types/WorkerProfile";
import { resolveMediaUrl } from "@/utils/media";
import {
    fieldRejectionNote,
    getNextRejectedStep,
    isFieldLocked,
    stepRoute,
} from "@/utils/rejectionFlow";
import { showErrorToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_EXPERIENCE_YEARS = 60;

export default function ExperienceStep() {
  const insets = useSafeAreaInsets();
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [certificateFile, setCertificateFile] = useState<PickedFile | null>(
    null,
  );
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  const { data: profile } = useGetWorkerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateWorkerProfileMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  const isRejectedFlow = profile?.status === "REJECTED";
  const bioNote = profile ? fieldRejectionNote(profile, "bio") : null;
  const yearsNote = profile
    ? fieldRejectionNote(profile, "experience_years")
    : null;
  const certificateNote = profile
    ? fieldRejectionNote(profile, "certificate_file")
    : null;
  const nextRejectedStep = isRejectedFlow
    ? getNextRejectedStep(profile?.rejected_fields, "experience")
    : null;
  const isBusy = isSaving || isSubmitting;

  const bioLocked = isFieldLocked(profile, "bio");
  const yearsLocked = isFieldLocked(profile, "experience_years");
  const certLocked = isFieldLocked(profile, "certificate_file");

  const existingCertificate = resolveMediaUrl(profile?.certificate_file);

  // Prefill 1 lần khi profile tải xong
  useEffect(() => {
    if (profile && !prefilled) {
      setBio(profile.bio ?? "");
      setExperienceYears(
        profile.experience_years != null
          ? String(profile.experience_years)
          : "",
      );
      setPrefilled(true);
    }
  }, [profile, prefilled]);

  const handleSubmit = async () => {
    const trimmedBio = bio.trim();
    const years = Number(experienceYears);

    if (!bioLocked && !trimmedBio) {
      setError("Vui lòng giới thiệu đôi nét về bản thân.");
      return;
    }
    if (
      !yearsLocked &&
      (experienceYears === "" ||
        Number.isNaN(years) ||
        years < 0 ||
        years > MAX_EXPERIENCE_YEARS)
    ) {
      setError("Số năm kinh nghiệm không hợp lệ.");
      return;
    }
    // Chứng chỉ bị admin đánh dấu sai -> bắt buộc tải lại
    if (!certLocked && certificateNote && !certificateFile) {
      setError("Vui lòng tải lại chứng chỉ theo yêu cầu của quản trị viên.");
      return;
    }
    if (!certificateFile && !existingCertificate) {
      setError("Vui lòng tải lên chứng chỉ/bằng cấp liên quan.");
      return;
    }

    setError("");
    try {
      // Chỉ gửi những field đang mở
      await updateProfile({
        ...(!bioLocked && { bio: trimmedBio }),
        ...(!yearsLocked && { experience_years: years }),
        ...(!certLocked &&
          certificateFile && { certificate_file: certificateFile }),
      }).unwrap();

      if (isRejectedFlow && nextRejectedStep) {
        router.push(stepRoute(nextRejectedStep));
        return;
      }

      await submitProfile().unwrap();
      router.replace("/(profile-setup)/success");
    } catch (e: any) {
      const message =
        e?.data?.message || "Gửi hồ sơ thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StepHeader step={5} totalSteps={5} />
      <ScrollView className="flex-1 px-5 pt-6">
        <View className="items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-3">
            <Feather name="award" size={22} color="#2563EB" />
          </View>
          <Text className="text-[#111827] text-2xl font-bold">
            Kinh nghiệm & chứng chỉ
          </Text>
          <Text className="text-[#6B7280] text-[15px] leading-5 mt-1 text-center">
            Thông tin này giúp khách hàng tin tưởng và lựa chọn bạn.
          </Text>
        </View>

        <Text className="text-[#111827] text-sm mb-2 mt-2">
          Giới thiệu bản thân
        </Text>
        <View
          className={`border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            bioLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <TextInput
            className={`text-[15px] ${
              bioLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Ví dụ: Tôi có kinh nghiệm dọn dẹp nhà cửa, cẩn thận và đúng giờ..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            editable={!bioLocked}
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: "top" }}
          />
        </View>
        {!!bioNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{bioNote}</Text>
        )}
        {!bioNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Số năm kinh nghiệm</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            yearsLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <Feather name="clock" size={17} color="#9CA3AF" />
          <TextInput
            className={`flex-1 ml-3 text-[15px] ${
              yearsLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Ví dụ: 2"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={2}
            value={experienceYears}
            editable={!yearsLocked}
            onChangeText={(text) =>
              setExperienceYears(text.replace(/[^0-9]/g, ""))
            }
          />
          <Text className="text-[#9CA3AF] text-[14px]">năm</Text>
          {yearsLocked && (
            <Feather
              name="lock"
              size={15}
              color="#9CA3AF"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
        {!!yearsNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{yearsNote}</Text>
        )}
        {!yearsNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">
          Chứng chỉ / bằng cấp
        </Text>
        <Text className="text-[#9CA3AF] text-xs mb-3">
          Ảnh chứng chỉ, giấy khen hoặc bằng cấp liên quan đến dịch vụ.
        </Text>
        <View className="mb-1" style={{ width: 140 }}>
          <ImageUploadBox
            label="Tải chứng chỉ"
            value={certificateFile}
            onChange={setCertificateFile}
            existingUri={existingCertificate}
            disabled={certLocked}
          />
        </View>
        {!!certificateNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{certificateNote}</Text>
        )}
        {!certificateNote && <View className="mb-3" />}

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
          onPress={handleSubmit}
          disabled={isBusy}
        >
          <Text className="text-white font-semibold text-[15px]">
            {isBusy
              ? "Đang xử lý..."
              : isRejectedFlow && nextRejectedStep
                ? "Tiếp tục"
                : "Hoàn tất hồ sơ"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
