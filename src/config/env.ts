// src/config/env.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
};
