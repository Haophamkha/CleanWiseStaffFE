// src/config/constants.ts
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export const ROUTES = {
  LOGIN: "/(auth)/login",
  REGISTER: "/(auth)/register",
  HOME: "/(tabs)/home",
} as const;

export const ALLOWED_APP_ROLE = "WORKER" as const;
