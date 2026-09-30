import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
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

const AVATAR = 112;
const AVATAR_RADIUS = 30;

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
  if (isLoading || isError) {
    return (
      <View
        className="mx-5 bg-canvas border border-line items-center py-12"
        style={{ borderRadius: RADIUS.sheet }}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="text-ink-soft text-sm mt-3">
              Đang tải hồ sơ...
            </Text>
          </>
        ) : (
          <>
            <Feather name="alert-circle" size={32} color={COLORS.danger} />
            <Text className="text-danger text-sm mt-3">
              Không thể tải hồ sơ
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View
      className="mx-5 bg-canvas border border-line overflow-hidden"
      style={{ borderRadius: RADIUS.sheet }}
    >
      {/* Vòng tròn kem đậm ở góc cho bớt phẳng */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -50,
          right: -40,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: COLORS.accentLight,
        }}
      />

      <View className="flex-row items-center p-4">
        {/* Avatar vuông bo góc + viên đánh giá đè đáy */}
        <View style={{ width: AVATAR, height: AVATAR + 14 }}>
          <View
            className="bg-accent-light items-center justify-center overflow-hidden"
            style={[
              {
                width: AVATAR,
                height: AVATAR,
                borderRadius: AVATAR_RADIUS,
                borderWidth: 4,
                borderColor: COLORS.surface,
              },
              SHADOWS.card,
            ]}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={44} color={COLORS.accentDark} />
            )}
          </View>

          <View
            className="absolute self-center flex-row items-center bg-surface border border-line rounded-full px-3 py-1"
            style={[{ bottom: 0 }, SHADOWS.card]}
          >
            <Feather name="star" size={12} color={COLORS.warning} />
            <Text className="text-ink text-[13px] font-extrabold ml-1">
              {ratingText}
            </Text>
          </View>
        </View>

        {/* Thông tin nhỏ gọn bên phải */}
        <View className="flex-1 ml-4">
          {statusInfo && (
            <View
              className="flex-row items-center self-start px-2.5 py-1 rounded-full mb-2"
              style={{ backgroundColor: statusInfo.bg }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: statusInfo.color }}
              />
              <Text
                className="text-[11px]"
                style={[TYPE.label, { color: statusInfo.text }]}
              >
                {statusInfo.label}
              </Text>
            </View>
          )}

          <Text className="text-ink text-lg font-extrabold" numberOfLines={1}>
            {fullName}
          </Text>

          {!!phone && (
            <View className="flex-row items-center mt-0.5">
              <Feather name="phone" size={12} color={COLORS.inkMuted} />
              <Text
                className="text-ink-soft text-[13px] ml-1.5"
                numberOfLines={1}
              >
                {phone}
              </Text>
            </View>
          )}

          <View className="flex-row items-center self-start bg-surface border border-line rounded-xl px-3 py-2 mt-3">
            <Feather name="check-circle" size={14} color={COLORS.success} />
            <Text className="text-ink text-sm font-extrabold ml-1.5">
              {totalJobs}
            </Text>
            <Text className="text-ink-soft text-xs ml-1">việc hoàn thành</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
