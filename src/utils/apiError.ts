export function getErrorMessage(err: any): string {
  if (err?.isNetworkError) {
    return err?.code === "ECONNABORTED"
      ? "Kết nối mạng chậm, yêu cầu bị hết thời gian chờ. Vui lòng thử lại."
      : "Không có kết nối mạng. Vui lòng kiểm tra và thử lại.";
  }

  const data = err?.data ?? err?.error?.data;
  if (!data) return "Có lỗi xảy ra, vui lòng thử lại.";
  if (typeof data === "string") return data;

  // Ưu tiên đọc lỗi chi tiết theo từng field trước (vd: {amount: "Số dư
  // ví không đủ."}) — đây mới là lý do thật sự, "message" chỉ là câu
  // chung chung "Dữ liệu gửi lên không hợp lệ." không nói lên gì cả.
  const fieldErrors = data.errors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.values(fieldErrors)
      .map((val) => (Array.isArray(val) ? val[0] : val))
      .filter(
        (val) => val !== undefined && val !== null && typeof val !== "boolean",
      )
      .map(String);
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

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
