import { TabHeader } from "@/components/common/TabHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProfileHero } from "@/features/profile/components/ProfileHero";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import { SettingsSheet } from "@/features/profile/components/SettingsSheet";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { ScrollView, View } from "react-native";

export default function ProfileScreen() {
  const p = useProfile();

  return (
    <View className="flex-1 bg-surface">
      <TabHeader title="Hồ sơ" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
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

        <View className="mx-5 mt-5">
          <PrimaryButton
            label="Đăng xuất"
            variant="outline"
            icon="log-out"
            onPress={p.requestLogout}
          />
        </View>
      </ScrollView>

      <SettingsSheet
        visible={p.settingsOpen}
        onClose={p.closeSettings}
        pushEnabled={p.pushEnabled}
        pushDisabled={p.pushDisabled}
        onTogglePush={p.handleTogglePush}
      />

      <ConfirmModal
        visible={p.logoutConfirmVisible}
        title="Đăng xuất?"
        message="Bạn sẽ cần đăng nhập lại để tiếp tục nhận việc và xem lịch làm."
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        onConfirm={p.confirmLogout}
        onCancel={p.cancelLogout}
      />
    </View>
  );
}
