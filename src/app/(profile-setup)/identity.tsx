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

// CCCD 12 số (chuẩn mới từ 2021) hoặc CMND 9 số (giấy tờ cũ vẫn còn hiệu lực)
const IDENTITY_NUMBER_REGEX = /^(\d{12}|\d{9})$/;

export default function IdentityStep() {
  const insets = useSafeAreaInsets();
  const [number, setNumber] = useState("");
  const [front, setFront] = useState<PickedFile | null>(null);
  const [back, setBack] = useState<PickedFile | null>(null);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  const { data: profile } = useGetWorkerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateWorkerProfileMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  const isRejectedFlow = profile?.status === "REJECTED";
  const numberNote = profile
    ? fieldRejectionNote(profile, "identity_number")
    : null;
  const frontNote = profile
    ? fieldRejectionNote(profile, "identity_front")
    : null;
  const backNote = profile
    ? fieldRejectionNote(profile, "identity_back")
    : null;
  const nextRejectedStep = isRejectedFlow
    ? getNextRejectedStep(profile?.rejected_fields, "identity")
    : null;
  const isBusy = isSaving || isSubmitting;

  // Số CCCD không bị admin đánh dấu sai -> hiện dữ liệu cũ nhưng khóa
  const numberLocked = isFieldLocked(profile, "identity_number");

  // BE yêu cầu mặt trước + mặt sau phải gửi cùng nhau, nên chỉ khóa cả hai
  // khi CẢ HAI đều không bị từ chối. Chỉ cần 1 mặt sai là mở khóa cả 2.
  const imagesLocked =
    isFieldLocked(profile, "identity_front") &&
    isFieldLocked(profile, "identity_back");
  const hasImageRejection = !imagesLocked && (!!frontNote || !!backNote);

  const existingFront = resolveMediaUrl(profile?.identity_front);
  const existingBack = resolveMediaUrl(profile?.identity_back);

  // Prefill 1 lần khi profile tải xong
  useEffect(() => {
    if (profile && !prefilled) {
      setNumber(profile.identity_number ?? "");
      setPrefilled(true);
    }
  }, [profile, prefilled]);

  const handleNext = async () => {
    const trimmedNumber = number.trim();

    if (!numberLocked) {
      if (!trimmedNumber) {
        setError("Vui lòng nhập số CCCD/CMND.");
        return;
      }
      if (!IDENTITY_NUMBER_REGEX.test(trimmedNumber)) {
        setError("Số CCCD/CMND không hợp lệ (phải gồm 9 hoặc 12 chữ số).");
        return;
      }
    }

    if (!imagesLocked) {
      // Có ảnh bị từ chối -> phải chọn lại đủ cả 2 mặt (BE yêu cầu gửi cùng nhau)
      if (hasImageRejection && (!front || !back)) {
        setError(
          "Vui lòng tải lại cả 2 mặt ảnh CCCD/CMND (mặt trước và mặt sau).",
        );
        return;
      }
      // Chưa có ảnh nào (hồ sơ mới) -> phải có đủ 2 mặt
      if ((!front && !existingFront) || (!back && !existingBack)) {
        setError("Vui lòng tải lên đủ ảnh mặt trước và mặt sau.");
        return;
      }
      // Chỉ chọn 1 mặt mới -> BE không nhận, bắt chọn cả hai
      if ((front && !back) || (!front && back)) {
        setError("Vui lòng chọn cả mặt trước và mặt sau để cập nhật ảnh.");
        return;
      }
    }

    setError("");
    try {
      // Chỉ gửi những field đang mở; ảnh luôn gửi cả cặp
      await updateProfile({
        ...(!numberLocked && { identity_number: trimmedNumber }),
        ...(!imagesLocked &&
          front &&
          back && {
            identity_front: front,
            identity_back: back,
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

      router.push("/(profile-setup)/service");
    } catch (e: any) {
      const message =
        e?.data?.message || "Cập nhật thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StepHeader step={2} totalSteps={5} />
      <ScrollView className="flex-1 px-5 pt-6">
        <View className="items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-3">
            <Feather name="credit-card" size={22} color="#2563EB" />
          </View>
          <Text className="text-[#111827] text-2xl font-bold">
            Xác thực danh tính
          </Text>
          <Text className="text-[#6B7280] text-[15px] leading-5 mt-1 text-center">
            Vui lòng cung cấp thông tin chính xác để hoàn tất quá trình xác
            thực.
          </Text>
        </View>

        <Text className="text-[#111827] text-sm mb-2 mt-2">Số CCCD / CMND</Text>
        <View
          className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-1 ${
            numberLocked ? "bg-[#F3F4F6]" : "bg-white"
          }`}
        >
          <Feather name="credit-card" size={17} color="#9CA3AF" />
          <TextInput
            className={`flex-1 ml-3 text-[15px] ${
              numberLocked ? "text-[#9CA3AF]" : "text-[#111827]"
            }`}
            placeholder="Nhập số CCCD/CMND"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={12}
            value={number}
            editable={!numberLocked}
            onChangeText={(text) => setNumber(text.replace(/[^0-9]/g, ""))}
          />
          {numberLocked && <Feather name="lock" size={15} color="#9CA3AF" />}
        </View>
        {!!numberNote && (
          <Text className="text-[#DC2626] text-xs mb-3">{numberNote}</Text>
        )}
        {!numberNote && <View className="mb-3" />}

        <Text className="text-[#111827] text-sm mb-2">Ảnh chụp CCCD/CMND</Text>
        <Text className="text-[#9CA3AF] text-xs mb-3">
          Yêu cầu ảnh rõ nét, không bị lóa sáng, thấy rõ 4 góc.
          {hasImageRejection ? " Khi sửa ảnh, bạn cần tải lại cả 2 mặt." : ""}
        </Text>
        <View className="flex-row gap-3 mb-1">
          <View className="flex-1">
            <ImageUploadBox
              label="Mặt trước"
              value={front}
              onChange={setFront}
              existingUri={existingFront}
              disabled={imagesLocked}
            />
            {!!frontNote && (
              <Text className="text-[#DC2626] text-xs mt-1.5">{frontNote}</Text>
            )}
          </View>
          <View className="flex-1">
            <ImageUploadBox
              label="Mặt sau"
              value={back}
              onChange={setBack}
              existingUri={existingBack}
              disabled={imagesLocked}
            />
            {!!backNote && (
              <Text className="text-[#DC2626] text-xs mt-1.5">{backNote}</Text>
            )}
          </View>
        </View>
        <View className="mb-3" />

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
          onPress={handleNext}
          disabled={isBusy}
        >
          <Text className="text-white font-semibold text-[15px]">
            {isBusy
              ? "Đang xử lý..."
              : isRejectedFlow && !nextRejectedStep
                ? "Hoàn tất & gửi lại"
                : isRejectedFlow
                  ? "Tiếp tục"
                  : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
