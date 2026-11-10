import { useTranslation } from "react-i18next";

import AppTabBar from "@/components/common/AppTabBar";
import { useTabsRealtime } from "@/features/chat/hooks/useTabsRealtime";
import { useAvailableJobsBadge } from "@/features/job/hooks/useAvailableJobsBadge";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { t: tr } = useTranslation();

  const { unreadLabel } = useTabsRealtime();
  const jobsBadge = useAvailableJobsBadge();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: tr("Trang chủ") }} />
      <Tabs.Screen
        name="jobs"
        options={{ title: tr("Công việc"), tabBarBadge: jobsBadge }}
      />
      <Tabs.Screen name="chatbot" options={{ title: tr("Trợ lý") }} />
      <Tabs.Screen
        name="messages"
        options={{ title: tr("Tin nhắn"), tabBarBadge: unreadLabel }}
      />
      <Tabs.Screen name="profile" options={{ title: tr("Cá nhân") }} />
    </Tabs>
  );
}