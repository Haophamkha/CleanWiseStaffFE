export const formatVnd = (value: string | number | undefined | null) => {
  const n = Math.round(Number(value ?? 0));
  const digits = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}${digits}đ`;
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
