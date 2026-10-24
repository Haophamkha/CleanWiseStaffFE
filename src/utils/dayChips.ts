import { translate as tr, getLocale } from "@/features/language/i18n";
import { pad2, toYMD } from "@/utils/format";

export type DayChip = { key: string | null; top: string; bottom: string };

export const DAY_CHIP_COUNT = 14;

export function buildDayChips(n: number): DayChip[] {
  const chips: DayChip[] = [{ key: null, top: tr("Tất cả"), bottom: "" }];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    chips.push({
      key: toYMD(d),
      top:
        i === 0
          ? tr("Hôm nay")
          : i === 1
            ? tr("Ngày mai")
            : d.toLocaleDateString(getLocale(), { weekday: "short" }),
      bottom: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
    });
  }
  return chips;
}
