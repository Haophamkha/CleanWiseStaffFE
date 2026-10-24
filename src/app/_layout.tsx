import { AppLanguageProvider } from "@/features/language/LanguageProvider";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { AppThemeProvider } from "@/features/theme/ThemeProvider";
import * as SplashScreen from "expo-splash-screen";
import { NetworkBanner } from "@/components/common/NetworkBanner";
import { toastConfig } from "@/config/toastConfig";

import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { store } from "@/store/store";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { COLORS } = useAppTheme();

  const { ready } = useAuthGuard();
  const insets = useSafeAreaInsets();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="schedule" />
      </Stack>
      <Toast config={toastConfig} topOffset={insets.top + 8} />
    </>
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
