import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { ON_DARK, RADIUS } from "@/constants/theme";
import { formatDayLabel } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HomeHeaderProps =
  | { variant: "brand" }
  | { variant: "greeting"; name: string; avatar: string | null; count?: number };

export function HomeHeader(props: HomeHeaderProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const isGreeting = props.variant === "greeting";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? tr("Ch\u00e0o bu\u1ed5i s\u00e1ng,") : hour < 18 ? tr("Ch\u00e0o bu\u1ed5i chi\u1ec1u,") : tr("Ch\u00e0o bu\u1ed5i t\u1ed1i,");
  const today = useMemo(() => formatDayLabel(new Date().toISOString(), tr), [tr]);

  return (
    <View
      className="bg-ink-panel px-5 flex-row items-center justify-between overflow-hidden"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: isGreeting ? 72 : 28,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      {/* Họa tiết vòng tròn mờ cho đỡ phẳng */}
      <LinearGradient pointerEvents="none" colors={[ON_DARK.surface, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -70,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: ON_DARK.surface,
          opacity: 0.35,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -50,
          left: -30,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: ON_DARK.surface,
          opacity: 0.25,
        }}
      />

      {props.variant === "greeting" ? (
        <View className="flex-row items-center flex-1 mr-3">
          <View
            className="items-center justify-center"
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              borderWidth: 2,
              borderColor: COLORS.primary,
            }}
          >
            {props.avatar ? (
              <Image
                source={{ uri: props.avatar }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <View
                className="items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: ON_DARK.surface,
                }}
              >
                <Feather name="user" size={20} color={ON_DARK.text} />
              </View>
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs" style={{ color: ON_DARK.textSoft }}>
              {greeting}</Text>
            <Text
              className="text-xl font-extrabold text-white"
              numberOfLines={1}
            >
              {props.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Feather name="calendar" size={12} color={ON_DARK.textMuted} />
              <Text
                className="text-xs ml-1.5"
                style={{ color: ON_DARK.textMuted }}
              >
                {today}{props.count !== undefined ? " \u00b7 " + tr("H\u00f4m nay b\u1ea1n c\u00f3 {{value0}} ca", { value0: props.count }) : ""}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center">
          <Image source={require("@assets/images/logo-mark.png")} style={{ width: 40, height: 40, borderRadius: 13, marginRight: 12 }} resizeMode="cover" />
          <Text
            className="text-white text-lg font-extrabold"
            style={{ letterSpacing: 0.3 }}
          >
            CleanWise Staff
          </Text>
        </View>
      )}

      {/* Nền trắng để chuông (thiết kế cho nền sáng) vẫn rõ trên header tối */}
      <View className="w-11 h-11 rounded-full bg-surface items-center justify-center overflow-hidden">
        <NotificationBellButton />
      </View>
    </View>
  );
}
