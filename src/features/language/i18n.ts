import { createInstance, type TOptions } from "i18next";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

export type AppLanguage = "vi" | "en";
export const LANGUAGE_STORAGE_KEY = "cleanwise_staff_language";
export const isAppLanguage = (value: unknown): value is AppLanguage => value === "vi" || value === "en";
export const i18n = createInstance();
// Bundled translations are available synchronously, including offline.
void i18n.init({
  lng: "vi", fallbackLng: "vi", supportedLngs: ["vi", "en"],
  resources: { vi: { translation: vi }, en: { translation: en } },
  initAsync: false, keySeparator: false, nsSeparator: false, returnNull: false,
  interpolation: { escapeValue: false }, react: { useSuspense: false },
});

// Source text keys keep the Vietnamese copy readable alongside its usage.
// Use only for app-owned labels; never translate arbitrary API/user content.
export function translate(key: string, options?: TOptions): string {
  return i18n.t(key, options ?? {}) as string;
}
// Pass the subscribed translator from renders so compiler memoization tracks locale changes.
export function getLocale(_translateText?: typeof translate): "vi-VN" | "en-US" {
  return i18n.resolvedLanguage === "en" ? "en-US" : "vi-VN";
}

const messageKeys = new Map<string, string>();
for (const dictionary of [vi, en]) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (!key.includes("{{")) messageKeys.set(value, key);
  }
}

// Validation errors can remain in screen state while the language changes.
// Recover their bundled key instead of displaying the previous translation.
// Unknown server messages are preserved. Use only for app error messages.
export function localizeKnownMessage(message: string, translateText = translate): string {
  const key = messageKeys.get(message);
  return key ? translateText(key) : message;
}
