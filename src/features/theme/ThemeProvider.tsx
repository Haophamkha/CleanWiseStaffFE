import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "expo-router/react-navigation";
import { APP_THEMES } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme, vars } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View } from "react-native";

export type ThemePreference = "light" | "dark";
export const THEME_STORAGE_KEY = "cleanwise_staff_appearance";
const isPreference = (value: unknown): value is ThemePreference => value === "light" || value === "dark";
type AppThemeContext = (typeof APP_THEMES)["light"] & {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};
const Context = createContext<AppThemeContext | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [preference, updatePreference] = useState<ThemePreference>("light");
  const [ready, setReady] = useState(false);
  const nativeTheme = useColorScheme();
  const nativeSetter = useRef(nativeTheme.setColorScheme);
  useEffect(() => { nativeSetter.current = nativeTheme.setColorScheme; });
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(value => {
      if (mounted && isPreference(value)) updatePreference(value);
    }).catch(() => {}).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    if (!isPreference(next)) return Promise.reject(new Error("Giao diện không hợp lệ."));
    updatePreference(next);
    // Serialize writes so rapid taps cannot persist an older selection last.
    const write = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(THEME_STORAGE_KEY, next));
    writes.current = write;
    return write;
  }, []);
  const mode = preference;
  const theme = APP_THEMES[mode];

  useEffect(() => {
    if (ready) nativeSetter.current(preference);
  }, [preference, ready]);

  useEffect(() => {
    if (!ready) return;
    SystemUI.setBackgroundColorAsync(theme.COLORS.canvas).catch(() => {});
    // Native modals use context; web portals need the same variables on the root.
    if (typeof document !== "undefined") {
      for (const [name, value] of Object.entries(theme.variables)) document.documentElement.style.setProperty(name, value);
      document.documentElement.style.colorScheme = mode;
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [ready, theme, mode]);

  const value = useMemo(() => ({ ...theme, preference, setPreference }), [theme, preference, setPreference]);
  const navigationTheme = useMemo(() => ({
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: { ...(theme.isDark ? DarkTheme : DefaultTheme).colors, primary: theme.COLORS.primary,
      background: theme.COLORS.canvas, card: theme.COLORS.surface, text: theme.COLORS.ink, border: theme.COLORS.line },
  }), [theme]);

  return (
    <Context.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor: theme.COLORS.canvas }, vars(theme.variables)]}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <NavigationThemeProvider value={navigationTheme}>{ready ? children : null}</NavigationThemeProvider>
      </View>
    </Context.Provider>
  );
}

export function useAppTheme(): AppThemeContext {
  const theme = useContext(Context);
  if (!theme) throw new Error("useAppTheme phải nằm trong AppThemeProvider.");
  return theme;
}
