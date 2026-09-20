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
  stepRoute,
} from "@/utils/rejectionFlow";
import { showErrorToast } from "@/utils/toast";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortraitStep() {
  const insets = useSafeAreaInsets();
  const [portrait, setPortrait] = useState<PickedFile | null>(null);
  const [error, setError] = useState("");

  const { data: profile } = useGetWorkerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateWorkerProfileMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  const isRejectedFlow = profile?.status === "REJECTED";
  const rejectionNote = profile
    ? fieldRejectionNote(profile, "portrait")
    : null;
  const nextRejectedStep = isRejectedFlow
    ? getNextRejectedStep(profile?.rejected_fields, "portrait")
    : null;
  const isBusy = isSaving || isSubmitting;

  const existingPortrait = resolveMediaUrl(profile?.portrait);

  const handleNext = async () => {
    // Ảnh bị admin đánh dấu sai -> bắt buộc chọn ảnh mới
    if (rejectionNote && !portrait) {
      setError("Vui lòng chọn ảnh mới theo yêu cầu của quản trị viên.");
      return;
    }
    if (!portrait && !existingPortrait) {
      setError("Vui lòng chọn ảnh chân dung.");
      return;
    }
    setError("");
    try {
      // Chỉ upload khi người dùng chọn ảnh mới
      if (portrait) {
        await updateProfile({ portrait }).unwrap();
      }

      if (isRejectedFlow) {
        if (nextRejectedStep) {
          router.push(stepRoute(nextRejectedStep));
        } else {
          await submitProfile().unwrap();
          router.replace("/(profile-setup)/success");
        }
        return;
      }

      router.push("/(profile-setup)/identity");
    } catch (e: any) {
      const message = e?.data?.message || "Tải ảnh thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StepHeader step={1} totalSteps={5} />
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-[#111827] text-2xl font-bold mb-2 text-center">
          Tải lên ảnh chân dung
        </Text>
        <Text className="text-[#6B7280] text-[15px] leading-5 mb-8 text-center">
          Ảnh này sẽ được sử dụng cho hồ sơ nhân viên của bạn.
        </Text>

        {!!rejectionNote && (
          <View className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-4 py-3 mb-6">
            <Text className="text-[#DC2626] text-xs font-semibold mb-1">
              Quản trị viên yêu cầu sửa lại
            </Text>
            <Text className="text-[#DC2626] text-sm">{rejectionNote}</Text>
          </View>
        )}

        <View className="mb-8">
          <ImageUploadBox
            label="Chọn ảnh"
            value={portrait}
            onChange={setPortrait}
            shape="circle"
            existingUri={existingPortrait}
          />
        </View>

        <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-base">💡</Text>
            <Text className="text-[#111827] font-semibold text-base ml-2">
              Mẹo chụp ảnh đẹp
            </Text>
          </View>
          {[
            { ok: true, text: "Chụp chính diện, rõ khuôn mặt." },
            { ok: true, text: "Đảm bảo ánh sáng tốt, không bị sấp bóng." },
            { ok: true, text: "Trang phục gọn gàng, lịch sự." },
            { ok: false, text: "Không đeo kính râm, mũ ." },
          ].map((tip) => (
            <View key={tip.text} className="flex-row items-start mb-2">
              <Text className={tip.ok ? "text-[#2563EB]" : "text-[#DC2626]"}>
                {tip.ok ? "✓" : "✕"}
              </Text>
              <Text className="text-[#374151] text-[14px] ml-2 flex-1">
                {tip.text}
              </Text>
            </View>
          ))}
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
          onPress={handleNext}
          disabled={isBusy}
        >
          <Text className="text-white font-semibold text-[15px]">
            {isBusy
              ? "Đang xử lý..."
              : isRejectedFlow && !nextRejectedStep
                ? "Hoàn tất & gửi lại"
                : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
