import { useTranslation } from "react-i18next";

import { TabHeader } from "@/components/common/TabHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { ProfileHero } from "@/features/profile/components/ProfileHero";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { t: tr } = useTranslation();

  const p = useProfile();
  const { COLORS } = useAppTheme();

  return (
    <View className="flex-1 bg-canvas">
      <TabHeader title={tr("Hồ sơ")} right={<Text className="text-primary text-xs font-semibold">CleanWise</Text>} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero
          isLoading={p.isLoading}
          isError={p.isError}
          fullName={p.fullName}
          phone={p.phone}
          avatarUri={p.avatarUri}
          ratingText={p.ratingText}
          totalJobs={p.totalJobs}
          statusInfo={p.statusInfo}
        />

        <ProfileMenu groups={p.menuGroups} />

        <View className="mx-5">
          <TouchableOpacity
            accessibilityRole="button"
            className="flex-row items-center justify-center bg-danger-light"
            style={{ minHeight: 46, padding: 12, borderRadius: 999 }}
            activeOpacity={0.7}
            onPress={p.requestLogout}
          >
            <Feather name="log-out" size={16} color={COLORS.danger} />
            <Text className="text-danger text-sm font-semibold ml-2">{tr("Đăng xuất")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={p.logoutConfirmVisible}
        title={tr("Đăng xuất?")}
        message={tr("Bạn sẽ cần đăng nhập lại để tiếp tục nhận việc và xem lịch làm.")}
        confirmLabel={tr("Đăng xuất")}
        cancelLabel={tr("Ở lại")}
        onConfirm={p.confirmLogout}
        onCancel={p.cancelLogout}
      />
    </View>
  );
}
