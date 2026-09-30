import {
    useGetActiveAreasQuery,
    useGetWorkingAreasQuery,
    useUpdateWorkingAreasMutation,
} from "@/features/auth/api/authApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

export type AreaOption = {
  id: number;
  name: string;
  selected: boolean;
};

export function useWorkingAreas() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: areas, isLoading: loadingAreas } = useGetActiveAreasQuery();
  const { data: myAreas, isLoading: loadingMyAreas } =
    useGetWorkingAreasQuery();

  const [updateWorkingAreas, { isLoading: isSaving }] =
    useUpdateWorkingAreasMutation();

  // Prefill 1 lần từ dữ liệu hiện có, tránh đè lựa chọn người dùng đang
  // thao tác nếu query refetch ngầm.
  useEffect(() => {
    if (myAreas && !initialized) {
      setSelected(new Set(myAreas.map((wa) => wa.area.id)));
      setInitialized(true);
    }
  }, [myAreas, initialized]);

  const filteredAreas: AreaOption[] = useMemo(() => {
    if (!areas) return [];
    const keyword = search.trim().toLowerCase();
    const list = keyword
      ? areas.filter((a) => a.name.toLowerCase().includes(keyword))
      : areas;
    return list.map((a) => ({
      id: a.id,
      name: a.name,
      selected: selected.has(a.id),
    }));
  }, [areas, search, selected]);

  const toggleArea = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (error) setError("");
  };

  const clearSearch = () => setSearch("");

  const handleSave = async () => {
    if (selected.size === 0) {
      setError("Vui lòng chọn ít nhất một khu vực hoạt động.");
      return;
    }
    setError("");
    try {
      await updateWorkingAreas(Array.from(selected)).unwrap();
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
    isLoading: loadingAreas || loadingMyAreas,
    isSaving,
    error,
    search,
    setSearch,
    clearSearch,
    areas: filteredAreas,
    selectedCount: selected.size,
    canSave: selected.size > 0,
    toggleArea,
    handleSave,
  };
}

export type WorkingAreasState = ReturnType<typeof useWorkingAreas>;
