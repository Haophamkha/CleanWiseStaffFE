/** The REST API uses the project's standard error envelope. */
export function getChatBlockedMessage(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("data" in error)) return null;
  const data = error.data;
  if (!data || typeof data !== "object" || !("error_code" in data)) return null;
  if (data.error_code !== "CHAT_CONTENT_BLOCKED") return null;
  return "message" in data && typeof data.message === "string"
    ? data.message
    : "Tin nhắn chứa nội dung vi phạm. Vui lòng chỉnh sửa để tiếp tục.";
}

/** Preserve text entered while the rejected request was in flight. */
export function restoreBlockedDraft(blocked: string, current: string): string {
  return current.trim() && current !== blocked ? `${blocked}\n${current}` : blocked;
}
