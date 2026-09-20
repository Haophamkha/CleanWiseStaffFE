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

  // Prefill dịch vụ đã đăng ký (chỉ khi người dùng chưa tự chọn)
  useEffect(() => {
    if (profile?.registered_service && selectedId === null) {
      setSelectedId(profile.registered_service.id);
    }
  }, [profile?.registered_service, selectedId]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return services;
    return services.filter((s) => s.name.toLowerCase().includes(keyword));
  }, [services, search]);

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
          {filteredServices.map((service) => {
            const isSelected = selectedId === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                onPress={() => {
                  setSelectedId(service.id);
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
                  {service.primary_image ? (
                    <Image
                      source={{ uri: service.primary_image }}
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
                    {service.name}
                  </Text>
                  {!!service.description && (
                    <Text
                      className="text-[#6B7280] text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {service.description}
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

          {filteredServices.length === 0 && (
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
