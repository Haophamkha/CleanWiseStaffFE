import { AppLanguageProvider } from "@/features/language/LanguageProvider";
import { SessionLoadingScreen } from "@/features/auth/components/SessionLoadingScreen";
import { AppThemeProvider } from "@/features/theme/ThemeProvider";
import * as SplashScreen from "expo-splash-screen";
import { NetworkBanner } from "@/components/common/NetworkBanner";
import { toastConfig } from "@/config/toastConfig";

import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useStaffRealtime } from "@/features/chat/hooks/useStaffRealtime";
import { store } from "@/store/store";
import Feather from "@expo/vector-icons/Feather";
import { loadAsync } from "expo-font";
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";
import { notifyPathChange } from "@/utils/navLock";

if (Platform.OS === "web" && typeof window !== "undefined") {
  // Register the font before Feather mounts so the browser can load it while the app renders.
  void loadAsync(Feather.font).catch((error: unknown) => {
    console.warn("Could not preload Feather icons.", error);
  });
}

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { ready, phase, retry, finish } = useAuthGuard();
  useStaffRealtime();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  useEffect(() => { notifyPathChange(); }, [pathname]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, opacity: ready ? 1 : 0 }} pointerEvents={ready ? "auto" : "none"}
        accessibilityElementsHidden={!ready} importantForAccessibility={ready ? "auto" : "no-hide-descendants"}>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="complaints/[id]" options={{ presentation: "transparentModal", animation: "fade" }} />
      </Stack>
      </View>
      {!ready && <View style={StyleSheet.absoluteFill}>
        <SessionLoadingScreen error={phase === "error"} success={phase === "success" || phase === "routing"}
          onRetry={() => { void retry(); }} onComplete={finish} />
      </View>}
      <Toast config={toastConfig} topOffset={insets.top + 8} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppLanguageProvider><AppThemeProvider><RootNavigator /></AppThemeProvider></AppLanguageProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
