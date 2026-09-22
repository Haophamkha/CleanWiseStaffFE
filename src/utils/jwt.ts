export type JwtPayload = {
  role?: string;
  user_id?: number;
  exp?: number;
  [key: string]: unknown;
};

function decodeBase64(value: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let bits = 0;
  let buffer = 0;
  for (const char of value) {
    if (char === "=") break;
    const digit = alphabet.indexOf(char);
    if (digit < 0) continue;
    buffer = (buffer << 6) | digit;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result += String.fromCharCode((buffer >> bits) & 255);
    }
  }
  return result;
}

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

    const binary = typeof atob === "function" ? atob(padded) : decodeBase64(padded);
    const json = decodeURIComponent(
      binary.split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false; // không có exp thì không tự kết luận hết hạn
  return Date.now() >= payload.exp * 1000;
}
