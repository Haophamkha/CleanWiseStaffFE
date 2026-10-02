import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS } from "@/constants/theme";
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
  const insets = useSafeAreaInsets();
  const p = useMyProfile();
  const v = p.view;

  if (p.isLoading || !v) {
    return (
      <View className="flex-1 bg-canvas">
        <SimpleHeader title="Hồ sơ của tôi" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader title="Hồ sơ của tôi" />

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

        <Section title="Thông tin cá nhân">
          <InfoRows rows={v.personalRows} />
        </Section>

        {!!v.bio && (
          <Section title="Giới thiệu">
            <Text className="text-ink text-sm leading-5 py-4">{v.bio}</Text>
          </Section>
        )}

        <Section title="Giấy tờ & dịch vụ">
          <InfoRows rows={v.documentRows} />
          <DocumentImages
            front={v.identityFront}
            back={v.identityBack}
            certificate={v.certificate}
          />
        </Section>

        {v.approvalRows && (
          <Section title="Phê duyệt">
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
