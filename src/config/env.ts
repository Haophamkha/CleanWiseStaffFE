import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// src/config/env.ts
export const ENV = {
  API_URL:
    Platform.OS === "web"
      ? configuredApiUrl.replace("://10.0.2.2", "://localhost")
      : configuredApiUrl,
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
};
