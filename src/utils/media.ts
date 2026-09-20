import { ENV } from "@/config/env";

export function resolveMediaUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${ENV.API_URL}${path}`;
}
