import { StepHeader } from "@/components/profile-setup/StepHeader";
import {
  useGetActiveServicesQuery,
  useGetWorkerProfileQuery,
  useSubmitWorkerProfileMutation,
  useUpdateWorkerProfileMutation,
} from "@/services/authApi";
import { getNextRejectedStep, stepRoute } from "@/utils/rejectionFlow";
import { showErrorToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tên hiển thị tuỳ chỉnh cho từng nhóm dịch vụ (section_code) khi 1 nhóm
// gồm nhiều service cụ thể mà worker được làm tất cả (vd HOME_CLEANING
// gồm cả ca lẻ + gói tháng). Section nào không có ở đây thì dùng tên của
// service đại diện (id nhỏ nhất trong nhóm).
const SECTION_DISPLAY_NAME: Record<string, string> = {
  HOME_CLEANING: "Dọn dẹp nhà (ca lẻ & định kỳ)",
};

export default function ServiceStep() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: services, isLoading: loadingServices } =
    useGetActiveServicesQuery();
  const { data: profile, isLoading: loadingProfile } =
    useGetWorkerProfileQuery();

  const [updateProfile, { isLoading: isSaving }] =
    useUpdateWorkerProfileMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  const isRejectedFlow = profile?.status === "REJECTED";
  const nextRejectedStep = isRejectedFlow
    ? getNextRejectedStep(profile?.rejected_fields, "service")
    : null;

  // Gộp các service cùng section_code thành 1 lựa chọn duy nhất, để worker
  // đăng ký 1 lần nhưng được làm tất cả service trong cùng nhóm (vd dọn
  // dẹp nhà ca lẻ + gói tháng là cùng 1 nghề, chỉ khác hình thức đặt).
  const groupedServices = useMemo(() => {
    if (!services) return [];
    const keyword = search.trim().toLowerCase();
    const filtered = keyword
      ? services.filter((s) => s.name.toLowerCase().includes(keyword))
      : services;

    const bySection = new Map<string, typeof services>();
    for (const s of filtered) {
      const key = s.section_code;
      if (!bySection.has(key)) bySection.set(key, []);
      bySection.get(key)!.push(s);
    }

    return Array.from(bySection.entries()).map(([sectionCode, list]) => {
      const sorted = [...list].sort((a, b) => a.id - b.id);
      const representative = sorted[0];
      return {
        sectionCode,
        representativeId: representative.id,
        memberIds: sorted.map((s) => s.id),
        name: SECTION_DISPLAY_NAME[sectionCode] ?? representative.name,
        description: representative.description,
        primary_image: representative.primary_image,
      };
    });
  }, [services, search]);

  // Prefill dịch vụ đã đăng ký (chỉ khi người dùng chưa tự chọn).
  // So theo section (memberIds) thay vì id cụ thể, vì service đã lưu
  // trước đó có thể không phải là id đại diện của nhóm.
  useEffect(() => {
    if (
      profile?.registered_service &&
      selectedId === null &&
      groupedServices.length > 0
    ) {
      const group = groupedServices.find((g) =>
        g.memberIds.includes(profile.registered_service.id),
      );
      if (group) setSelectedId(group.representativeId);
    }
  }, [profile?.registered_service, groupedServices, selectedId]);

  const isLoading = loadingServices || loadingProfile;
  const isBusy = isSaving || isSubmitting;

  const handleNext = async () => {
    if (!selectedId) {
      setError("Vui lòng chọn loại dịch vụ bạn muốn đăng ký.");
      return;
    }
    setError("");
    try {
      await updateProfile({ service_id: selectedId }).unwrap();

      if (isRejectedFlow) {
        if (nextRejectedStep) {
          router.push(stepRoute(nextRejectedStep));
        } else {
          await submitProfile().unwrap();
          router.replace("/(profile-setup)/success");
        }
        return;
      }

      router.push("/(profile-setup)/area");
    } catch (e: any) {
      const message =
        e?.data?.message || "Cập nhật thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StepHeader step={3} totalSteps={5} />

      <View className="px-5 pt-6 pb-2">
        <Text className="text-[#111827] text-2xl font-bold mb-2">
          Loại dịch vụ
        </Text>
        <Text className="text-[#6B7280] text-[15px] leading-5 mb-4">
          Chọn loại dịch vụ bạn muốn đăng ký thực hiện.
        </Text>

        <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 mb-3">
          <Feather name="search" size={17} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-[#111827] text-[15px]"
            placeholder="Tìm dịch vụ..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {groupedServices.map((group) => {
            const isSelected = group.memberIds.includes(selectedId ?? -1);
            return (
              <TouchableOpacity
                key={group.sectionCode}
                onPress={() => {
                  setSelectedId(group.representativeId);
                  if (error) setError("");
                }}
                activeOpacity={0.8}
                className={`flex-row items-center rounded-2xl border px-4 py-3.5 mb-3 ${
                  isSelected
                    ? "border-[#2563EB] bg-[#EEF2FF]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <View className="w-12 h-12 rounded-xl bg-[#F3F4F6] overflow-hidden mr-3 items-center justify-center">
                  {group.primary_image ? (
                    <Image
                      source={{ uri: group.primary_image }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Feather name="briefcase" size={18} color="#9CA3AF" />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-[15px] font-semibold ${
                      isSelected ? "text-[#2563EB]" : "text-[#111827]"
                    }`}
                    numberOfLines={1}
                  >
                    {group.name}
                  </Text>
                  {!!group.description && (
                    <Text
                      className="text-[#6B7280] text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {group.description}
                    </Text>
                  )}
                </View>
                {isSelected ? (
                  <Feather name="check-circle" size={20} color="#2563EB" />
                ) : (
                  <View
                    className="w-5 h-5 rounded-full"
                    style={{ borderWidth: 2, borderColor: "#E5E7EB" }}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {groupedServices.length === 0 && (
            <Text className="text-[#9CA3AF] text-center text-sm mt-6">
              Không tìm thấy dịch vụ phù hợp.
            </Text>
          )}
        </ScrollView>
      )}

      {!!error && (
        <Text className="text-[#DC2626] text-sm px-5 mb-2">{error}</Text>
      )}

      <View
        className="px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            !selectedId ? "bg-[#93C5FD]" : "bg-[#2563EB]"
          }`}
          onPress={handleNext}
          disabled={isBusy || !selectedId}
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
