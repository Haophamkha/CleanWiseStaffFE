import { useTranslation } from "react-i18next";

import type { ProfileStatusInfo } from "@/features/profile/hooks/useProfile";
import { useAppTheme } from "@/features/theme/ThemeProvider";
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

const AVATAR = 72;

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
  const { COLORS, SHADOWS } = useAppTheme();

  if (isLoading || isError) {
    return (
      <View className="mx-5 items-center py-6">
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="text-ink-soft text-sm mt-3">
              {tr("Đang tải hồ sơ...")}
            </Text>
          </>
        ) : (
          <>
            <Feather name="alert-circle" size={32} color={COLORS.danger} />
            <Text className="text-danger text-sm mt-3">
              {tr("Không thể tải hồ sơ")}
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View
      className="mx-5 bg-surface border border-line"
      style={[{ borderRadius: 24, padding: 18 }, SHADOWS.card]}
    >
      <View className="flex-row items-center">
        <View
          style={[
            { padding: 3, borderRadius: 999, backgroundColor: COLORS.white },
            SHADOWS.card,
          ]}
        >
          <View
            className="items-center justify-center overflow-hidden"
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: AVATAR / 2,
              backgroundColor: COLORS.primarySoft,
            }}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: AVATAR, height: AVATAR }}
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={32} color={COLORS.primary} />
            )}
          </View>
        </View>

        <View className="flex-1" style={{ marginLeft: 14 }}>
          <Text
            className="text-ink font-extrabold"
            style={{ fontSize: 19, lineHeight: 25 }}
            numberOfLines={1}
          >
            {fullName}
          </Text>
          {!!phone && (
            <Text
              className="text-ink-soft"
              style={{ fontSize: 13, marginTop: 2 }}
            >
              {phone}
            </Text>
          )}
          {statusInfo && (
            <View
              className="self-start"
              style={{
                marginTop: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: statusInfo.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: "700",
                  color: statusInfo.text,
                }}
              >
                {statusInfo.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Thống kê */}
      <View
        className="flex-row"
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: COLORS.line,
        }}
      >
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Feather name="star" size={16} color={COLORS.accent} />
            <Text
              className="text-ink font-extrabold"
              style={{ fontSize: 18, marginLeft: 6 }}
            >
              {ratingText}
            </Text>
          </View>
          <Text
            className="text-ink-muted"
            style={{ fontSize: 12, marginTop: 2 }}
          >
            {tr("đánh giá")}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: COLORS.line }} />
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Feather name="check-circle" size={16} color={COLORS.success} />
            <Text
              className="text-ink font-extrabold"
              style={{ fontSize: 18, marginLeft: 6 }}
            >
              {totalJobs}
            </Text>
          </View>
          <Text
            className="text-ink-muted"
            style={{ fontSize: 12, marginTop: 2 }}
          >
            {tr("việc hoàn thành")}
          </Text>
        </View>
      </View>
    </View>
  );
}
