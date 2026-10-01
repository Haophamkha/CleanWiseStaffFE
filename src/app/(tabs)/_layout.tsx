import AppTabBar from "@/components/common/AppTabBar";
import { useTabsRealtime } from "@/features/chat/hooks/useTabsRealtime";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { unreadLabel } = useTabsRealtime();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="jobs" options={{ title: "Công việc" }} />
      <Tabs.Screen name="chatbot" options={{ title: "Trợ lý" }} />
      <Tabs.Screen
        name="messages"
        options={{ title: "Tin nhắn", tabBarBadge: unreadLabel }}
      />
      <Tabs.Screen name="profile" options={{ title: "Cá nhân" }} />
    </Tabs>
  );
}
