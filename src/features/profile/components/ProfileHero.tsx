import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { ProfileStatusInfo } from "@/features/profile/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Image, Text, View } from "react-native";

type ProfileHeroProps = {
  isLoading: boolean;
  isError: boolean;
  fullName: string;
  phone: string;
  avatarUri: string | null;
  ratingText: string;
  totalJobs: number;
  statusInfo: ProfileStatusInfo | null;
};

const AVATAR = 46;

export function ProfileHero({
  isLoading,
  isError,
  fullName,
  phone,
  avatarUri,
  ratingText,
  totalJobs,
  statusInfo,
}: ProfileHeroProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  if (isLoading || isError) {
    return (
      <View
        className="mx-5 items-center py-4"
        style={{ borderRadius: 18 }}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="text-ink-soft text-sm mt-3">
              {tr("Đang tải hồ sơ...")}</Text>
          </>
        ) : (
          <>
            <Feather name="alert-circle" size={32} color={COLORS.danger} />
            <Text className="text-danger text-sm mt-3">
              {tr("Không thể tải hồ sơ")}</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View className="mx-5">
      <View className="flex-row items-center">
        <View
          className="bg-surface-muted items-center justify-center overflow-hidden"
          style={{ width: AVATAR, height: AVATAR, borderRadius: 15 }}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: AVATAR, height: AVATAR }} resizeMode="cover" />
          ) : (
            <Feather name="user" size={25} color={COLORS.inkSoft} />
          )}
        </View>
        <View className="flex-1 ml-3 mr-2">
          <Text className="text-ink font-bold" style={{ fontSize: 15, lineHeight: 21 }}>
            {fullName}
          </Text>
          {!!phone && <Text className="text-ink-soft mt-0.5" style={{ fontSize: 11, lineHeight: 16 }}>{phone}</Text>}
        </View>
        {statusInfo && (
          <View style={{ maxWidth: "32%", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, backgroundColor: statusInfo.bg }}>
            <Text className="text-center" style={{ fontSize: 11, lineHeight: 15, color: statusInfo.text }}>
              {statusInfo.label}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row flex-wrap items-center mt-3" style={{ gap: 14 }}>
        <View className="flex-row items-center">
          <Feather name="star" size={14} color={COLORS.inkSoft} />
          <Text className="text-ink font-semibold ml-1" style={{ fontSize: 12 }}>{ratingText}</Text>
          <Text className="text-ink-soft ml-1" style={{ fontSize: 11 }}>{tr("đánh giá")}</Text>
        </View>
        <View className="flex-row items-center">
          <Feather name="check-circle" size={14} color={COLORS.success} />
          <Text className="text-ink font-semibold ml-1" style={{ fontSize: 12 }}>{totalJobs}</Text>
          <Text className="text-ink-soft ml-1" style={{ fontSize: 11 }}>{tr("việc hoàn thành")}</Text>
        </View>
      </View>
    </View>
  );
}
