import { StepHeader } from "@/components/profile-setup/StepHeader";
import {
  useGetActiveAreasQuery,
  useGetWorkingAreasQuery,
  useSubmitWorkerProfileMutation,
  useUpdateWorkingAreasMutation,
} from "@/services/authApi";
import { showErrorToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AreaStep() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const { data: areas, isLoading: loadingAreas } = useGetActiveAreasQuery();
  const { data: myAreas, isLoading: loadingMyAreas } =
    useGetWorkingAreasQuery();

  const [updateWorkingAreas, { isLoading: isSaving }] =
    useUpdateWorkingAreasMutation();
  const [submitProfile, { isLoading: isSubmitting }] =
    useSubmitWorkerProfileMutation();

  useEffect(() => {
    if (myAreas && myAreas.length > 0) {
      setSelected(new Set(myAreas.map((wa) => wa.area.id)));
    }
  }, [myAreas]);

  const filteredAreas = useMemo(() => {
    if (!areas) return [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return areas;
    return areas.filter((a) => a.name.toLowerCase().includes(keyword));
  }, [areas, search]);

  const toggleArea = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (error) setError("");
  };

  const isLoading = loadingAreas || loadingMyAreas;
  const isBusy = isSaving || isSubmitting;

  const handleSubmit = async () => {
    if (selected.size === 0) {
      setError("Vui lòng chọn ít nhất một khu vực hoạt động.");
      return;
    }
    setError("");
    try {
      await updateWorkingAreas(Array.from(selected)).unwrap();
      await submitProfile().unwrap();
      router.replace("/(profile-setup)/experience");
    } catch (e: any) {
      const message =
        e?.data?.message || "Cập nhật khu vực thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StepHeader step={4} totalSteps={5} />

      <View className="px-5 pt-6 pb-2">
        <Text className="text-[#111827] text-2xl font-bold mb-2">
          Khu vực hoạt động
        </Text>
        <Text className="text-[#6B7280] text-[15px] leading-5 mb-4">
          Chọn các tỉnh/thành bạn có thể nhận việc. Bạn cần chọn ít nhất một khu
          vực.
        </Text>

        <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 mb-3">
          <Feather name="search" size={17} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-[#111827] text-[15px]"
            placeholder="Tìm tỉnh/thành..."
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

        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-[#6B7280] text-sm">
            Đã chọn{" "}
            <Text className="text-[#2563EB] font-semibold">
              {selected.size}
            </Text>{" "}
            khu vực
          </Text>
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
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {filteredAreas.map((area) => {
              const isSelected = selected.has(area.id);
              return (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => toggleArea(area.id)}
                  activeOpacity={0.7}
                  style={{ width: "47%" }}
                  className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
                    isSelected
                      ? "border-[#2563EB] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <Text
                    className={`text-[14px] flex-1 ${
                      isSelected
                        ? "text-[#2563EB] font-semibold"
                        : "text-[#374151]"
                    }`}
                    numberOfLines={1}
                  >
                    {area.name}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check-circle"
                      size={16}
                      color="#2563EB"
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredAreas.length === 0 && (
            <Text className="text-[#9CA3AF] text-center text-sm mt-6">
              Không tìm thấy khu vực phù hợp.
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
            selected.size === 0 ? "bg-[#93C5FD]" : "bg-[#2563EB]"
          }`}
          onPress={handleSubmit}
          disabled={isBusy || selected.size === 0}
        >
          <Text className="text-white font-semibold text-[15px]">
            {isBusy ? "Đang gửi hồ sơ..." : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
