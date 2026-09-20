export type JwtPayload = {
  role?: string;
  user_id?: number;
  exp?: number;
  [key: string]: unknown;
};

// Decode phần payload của JWT (base64url) — CHỈ để đọc claim (vd: role) phía
// client cho mục đích điều hướng UX, KHÔNG dùng để xác thực bảo mật (việc đó
// luôn do BE làm qua permission_classes ở mỗi endpoint).
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const json =
      typeof atob === "function"
        ? decodeURIComponent(
            atob(padded)
              .split("")
              .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
              .join(""),
          )
        : Buffer.from(padded, "base64").toString("utf-8");

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false; // không có exp thì không tự kết luận hết hạn
  return Date.now() >= payload.exp * 1000;
}
