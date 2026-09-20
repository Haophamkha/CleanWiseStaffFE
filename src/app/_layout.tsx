import { NetworkBanner } from "@/components/common/NetworkBanner";
import { toastConfig } from "@/config/toastConfig";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { store } from "@/store/store";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

function RootNavigator() {
  const { ready } = useAuthGuard();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
