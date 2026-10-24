import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n, isAppLanguage, LANGUAGE_STORAGE_KEY, type AppLanguage } from "./i18n";

type LanguageContext = { language: AppLanguage; setLanguage: (language: AppLanguage) => Promise<void> };
const Context = createContext<LanguageContext | null>(null);

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>("vi");
  const [ready, setReady] = useState(false);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      let next: AppLanguage = "vi";
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (isAppLanguage(saved)) next = saved;
      } catch { /* Default to Vietnamese if storage is unavailable. */ }
      if (!mounted) return;
      await i18n.changeLanguage(next);
      if (mounted) { updateLanguage(next); setReady(true); }
    };
    void restore();
    return () => { mounted = false; };
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    if (!isAppLanguage(next)) return Promise.reject(new Error("Unsupported language"));
    updateLanguage(next);
    // Resources are bundled, so the visible language changes without a request.
    const change = i18n.changeLanguage(next);
    const write = writes.current.catch(() => {}).then(async () => {
      await change;
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    });
    writes.current = write;
    return write;
  }, []);

  useEffect(() => {
    if (ready && typeof document !== "undefined") document.documentElement.lang = language;
  }, [language, ready]);
  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <I18nextProvider i18n={i18n}><Context.Provider value={value}>{ready ? children : null}</Context.Provider></I18nextProvider>;
}

export function useAppLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error("useAppLanguage requires AppLanguageProvider");
  return context;
}
