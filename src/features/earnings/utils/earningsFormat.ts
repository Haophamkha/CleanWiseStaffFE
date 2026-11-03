import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
export const formatVnd = (value: string | number | undefined | null, translateText = defaultTranslate) => {
  const n = Math.round(Number(value ?? 0));
  const digits = Math.abs(n).toLocaleString(getLocale(translateText));
  return translateText("{{value0}}{{value1}}đ", { value0: n < 0 ? "-" : "", value1: digits });
};

// "2026-09-24" -> "24/09"
export const formatDayMonth = (ymd?: string) => {
  if (!ymd) return "";
  const [, m, d] = ymd.split("-");
  return `${d}/${m}`;
};

// ISO -> "24/09 14:30"
export const formatEarningDateTime = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}`;
};
