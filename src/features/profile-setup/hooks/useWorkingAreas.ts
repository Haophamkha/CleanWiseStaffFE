import {
  useGetWorkingAreasQuery,
  useUpdateWorkingAreasMutation,
} from "@/features/auth/api/authApi";
import { useAreaSelection } from "@/features/profile-setup/hooks/useAreaSelection";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export function useWorkingAreas() {
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [areaIds, setAreaIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: myAreas, isLoading: loadingMyAreas } =
    useGetWorkingAreasQuery();
  const [updateWorkingAreas, { isLoading: isSaving }] =
    useUpdateWorkingAreasMutation();

  useEffect(() => {
    if (myAreas && !initialized) {
      setAreaIds(myAreas.map((wa) => wa.area.id));
      setProvinceCode(myAreas[0]?.area.province_code ?? null);
      setInitialized(true);
    }
  }, [myAreas, initialized]);

  const area = useAreaSelection({
    provinceCode,
    areaIds,
    onChange: (next) => {
      setProvinceCode(next.provinceCode);
      setAreaIds(next.areaIds);
      if (error) setError("");
    },
  });

  const handleSave = async () => {
    if (areaIds.length === 0) {
      setError("Vui lòng chọn ít nhất một khu vực hoạt động.");
      return;
    }
    setError("");
    try {
      await updateWorkingAreas(areaIds).unwrap();
      showSuccessToast("Thành công", "Đã cập nhật khu vực hoạt động.");
      router.back();
    } catch (e: any) {
      const message =
        e?.data?.message || "Cập nhật khu vực thất bại, vui lòng thử lại.";
      setError(message);
      showErrorToast("Lỗi", message);
    }
  };

  return {
    isLoading: loadingMyAreas,
    isSaving,
    error,
    area,
    canSave: areaIds.length > 0,
    handleSave,
  };
}

export type WorkingAreasState = ReturnType<typeof useWorkingAreas>;
