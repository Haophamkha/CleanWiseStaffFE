import { NetworkBanner } from "@/components/common/NetworkBanner";
import { toastConfig } from "@/config/toastConfig";
import { store } from "@/store/store";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast config={toastConfig} />
    </Provider>
  );
}
