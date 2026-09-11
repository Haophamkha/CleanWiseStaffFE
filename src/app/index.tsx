import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        setHasToken(!!token && token !== "undefined" && token !== "null");
      } catch {
        setHasToken(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return <Redirect href={hasToken ? "/(tabs)/home" : "/(auth)/login"} />;
}
