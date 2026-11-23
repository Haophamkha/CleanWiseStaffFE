import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

import {
  DocumentImages,
  InfoRows,
  ProfileStatusPanel,
  Section,
} from "@/features/profile-setup/components/MyProfileKit";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { useMyProfile } from "@/features/profile-setup/hooks/useMyProfile";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyProfileScreen() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const p = useMyProfile();
  const v = p.view;

  if (p.isLoading || !v) {
    return (
      <View className="flex-1 bg-canvas">
        <SimpleHeader title={tr("Hồ sơ của tôi")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader title={tr("Hồ sơ của tôi")} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileStatusPanel view={v} />

        <Section title={tr("Thông tin cá nhân")}>
          <InfoRows rows={v.personalRows} />
        </Section>

        {!!v.bio && (
          <Section title={tr("Giới thiệu")}>
            <Text className="text-ink text-sm leading-5 py-4">{v.bio}</Text>
          </Section>
        )}

        <Section title={tr("Giấy tờ & dịch vụ")}>
          <InfoRows rows={v.documentRows} />
          <DocumentImages
            front={v.identityFront}
            back={v.identityBack}
            certificate={v.certificate}
          />
        </Section>

        {v.approvalRows && (
          <Section title={tr("Phê duyệt")}>
            <InfoRows rows={v.approvalRows} />
          </Section>
        )}

        {v.canUpdate && (
          <View className="mt-6">
            <PrimaryButton
              label={v.updateLabel}
              variant="primary"
              icon="edit-3"
              onPress={p.handleUpdate}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
