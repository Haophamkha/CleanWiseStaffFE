import { translate as tr, getLocale } from "@/features/language/i18n";
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(getLocale(), {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeShort(iso: string) {
  return new Date(iso).toLocaleString(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayLabel(iso: string) {
  return new Date(iso).toLocaleDateString(getLocale(), {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(startIso: string, endIso: string) {
  const totalMin = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
}

export function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function relativeDayLabel(iso: string): string | null {
  const diff = Math.round(
    (startOfDay(new Date(iso)) - startOfDay(new Date())) / 86400000,
  );
  if (diff === 0) return tr("Hôm nay");
  if (diff === 1) return tr("Ngày mai");
  return null;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
