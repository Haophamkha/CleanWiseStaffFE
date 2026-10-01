import {
    useGetActiveAreasQuery,
    useGetActiveProvincesQuery,
} from "@/features/auth/api/authApi";
import { useMemo, useState } from "react";

export type AreaSelectionChange = {
  provinceCode: string | null;
  areaIds: number[];
};

export type WardOption = { id: number; name: string; selected: boolean };

// Bỏ dấu để tìm "ha noi" ra "Hà Nội"
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

export function useAreaSelection({
  provinceCode,
  areaIds,
  onChange,
}: {
  provinceCode: string | null;
  areaIds: number[];
  onChange: (next: AreaSelectionChange) => void;
}) {
  const [search, setSearch] = useState("");

  const provincesQuery = useGetActiveProvincesQuery();
  const areasQuery = useGetActiveAreasQuery(
    { province_code: provinceCode ?? "" },
    { skip: !provinceCode },
  );

  const step: "province" | "ward" = provinceCode ? "ward" : "province";
  const keyword = fold(search.trim());
  const selectedSet = useMemo(() => new Set(areaIds), [areaIds]);

  const provinces = useMemo(() => {
    const list = provincesQuery.data ?? [];
    return keyword ? list.filter((p) => fold(p.city).includes(keyword)) : list;
  }, [provincesQuery.data, keyword]);

  const provinceName = useMemo(
    () =>
      provincesQuery.data?.find((p) => p.province_code === provinceCode)
        ?.city ??
      areasQuery.currentData?.[0]?.city ??
      "",
    [provincesQuery.data, areasQuery.currentData, provinceCode],
  );

  const wards: WardOption[] = useMemo(() => {
    if (!provinceCode) return [];
    const list = areasQuery.currentData ?? [];
    const filtered = keyword
      ? list.filter((a) => fold(a.name).includes(keyword))
      : list;
    return filtered.map((a) => ({
      id: a.id,
      name: a.name,
      selected: selectedSet.has(a.id),
    }));
  }, [areasQuery.currentData, provinceCode, keyword, selectedSet]);

  const allVisibleSelected = wards.length > 0 && wards.every((w) => w.selected);

  const isLoading =
    step === "province"
      ? provincesQuery.isLoading
      : !areasQuery.currentData && areasQuery.isFetching;

  const selectProvince = (code: string) => {
    setSearch("");
    onChange({ provinceCode: code, areaIds: [] });
  };

  // Đổi tỉnh -> xóa phường đã chọn
  const changeProvince = () => {
    setSearch("");
    onChange({ provinceCode: null, areaIds: [] });
  };

  const toggleArea = (id: number) => {
    const next = new Set(areaIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ provinceCode, areaIds: Array.from(next) });
  };

  const toggleAllVisible = () => {
    const visible = wards.map((w) => w.id);
    const next = allVisibleSelected
      ? areaIds.filter((id) => !visible.includes(id))
      : Array.from(new Set([...areaIds, ...visible]));
    onChange({ provinceCode, areaIds: next });
  };

  return {
    step,
    search,
    setSearch,
    isLoading,
    provinces,
    provinceName,
    wards,
    selectedCount: areaIds.length,
    allVisibleSelected,
    selectProvince,
    changeProvince,
    toggleArea,
    toggleAllVisible,
  };
}

export type AreaSelectionState = ReturnType<typeof useAreaSelection>;
