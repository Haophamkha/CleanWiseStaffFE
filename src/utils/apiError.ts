export function getErrorMessage(err: any): string {
  if (err?.isNetworkError) {
    return err?.code === "ECONNABORTED"
      ? "Kết nối mạng chậm, yêu cầu bị hết thời gian chờ. Vui lòng thử lại."
      : "Không có kết nối mạng. Vui lòng kiểm tra và thử lại.";
  }

  const data = err?.data ?? err?.error?.data;
  if (!data) return "Có lỗi xảy ra, vui lòng thử lại.";
  if (typeof data === "string") return data;

  const preferredKeys = ["message", "detail", "error", "non_field_errors"];
  for (const key of preferredKeys) {
    const val = data[key];
    if (val !== undefined && val !== null && typeof val !== "boolean") {
      return Array.isArray(val) ? String(val[0]) : String(val);
    }
  }

  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val === undefined || val === null || typeof val === "boolean") continue;
    return Array.isArray(val) ? String(val[0]) : String(val);
  }

  return "Có lỗi xảy ra, vui lòng thử lại.";
}

export function isNetworkError(err: any): boolean {
  if (err?.isNetworkError === true) return true;
  if (err?.error?.isNetworkError === true) return true;
  return !err?.status && !err?.data && !err?.error?.data;
}
