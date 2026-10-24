import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/features/notification/api/notificationApi";
import { SettingsScreen } from "@/features/profile/components/SettingsScreen";
import { showErrorToast } from "@/utils/toast";

export default function SettingsRoute() {
  const { t: tr } = useTranslation();
  const { data: pref } = useGetNotificationPreferencesQuery();
  const [updatePref, { isLoading }] = useUpdateNotificationPreferencesMutation();

  const togglePush = async (value: boolean) => {
    try {
      await updatePref({ push_enabled: value }).unwrap();
    } catch {
      showErrorToast(tr("Chưa lưu được cài đặt thông báo"), tr("Vui lòng thử lại."));
    }
  };

  return (
    <SettingsScreen
      onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/profile")}
      pushEnabled={pref?.push_enabled ?? true}
      pushDisabled={!pref || isLoading}
      onTogglePush={togglePush}
    />
  );
}
