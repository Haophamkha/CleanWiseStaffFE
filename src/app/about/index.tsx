import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { goBackOrReplace } from "@/utils/navigation";
import type { ComponentProps, ReactNode } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherName = ComponentProps<typeof Feather>["name"];

const EMAIL = "haophamdv0631@gmail.com";
const ZALO = "0961439551";

function open(url: string) {
  Linking.openURL(url).catch(() => {});
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { SHADOWS } = useAppTheme();
  return (
    <View className="mt-5">
      <Text
        className="text-ink-muted text-xs mb-2 ml-1"
        style={{ fontWeight: "700", letterSpacing: 1 }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        className="bg-surface border border-line"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: FeatherName;
  label: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const { COLORS } = useAppTheme();
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole={onPress ? "button" : undefined}
      className={`flex-row items-center px-4 py-3.5 ${last ? "" : "border-b border-line"}`}
    >
      <View
        className="items-center justify-center"
        style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accentLight }}
      >
        <Feather name={icon} size={17} color={COLORS.ink} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-ink-muted text-xs">{label}</Text>
        <Text className="text-ink text-sm font-semibold mt-0.5">{value}</Text>
      </View>
      {!!onPress && <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />}
    </TouchableOpacity>
  );
}

function Highlight({ icon, label }: { icon: FeatherName; label: string }) {
  const { COLORS } = useAppTheme();
  return (
    <View className="flex-1 items-center">
      <View
        className="items-center justify-center"
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accentLight }}
      >
        <Feather name={icon} size={19} color={COLORS.ink} />
      </View>
      <Text className="text-ink text-xs font-semibold text-center mt-2">{label}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center px-3 pb-3">
          <TouchableOpacity
            onPress={() => goBackOrReplace("/(tabs)/profile")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={tr("Quay l\u1ea1i")}
            className="items-center justify-center"
            style={{ width: 40, height: 44 }}
          >
            <Feather name="chevron-left" size={30} color={COLORS.ink} />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-ink text-base font-extrabold"
            style={{ letterSpacing: 0.3 }}
          >
            {tr("V\u1ec1 CleanWise")}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-surface border border-line items-center px-6 py-7"
          style={[{ borderRadius: RADIUS.hero }, SHADOWS.card]}
        >
          <Image
            source={require("@assets/images/logo-mark.png")}
            style={[{ width: 84, height: 84, borderRadius: 26 }, SHADOWS.float]}
            resizeMode="cover"
          />
          <Text className="text-ink text-xl font-extrabold mt-4">CleanWise Staff</Text>
          <View className="bg-accent-light rounded-full px-3 py-1 mt-2">
            <Text className="text-ink-soft text-xs font-semibold">
              {tr("Phi\u00ean b\u1ea3n 1.0.0")}
            </Text>
          </View>
          <Text className="text-ink-soft text-sm text-center mt-3">
            {tr("Nh\u00e0 s\u1ea1ch h\u01a1n, cu\u1ed9c s\u1ed1ng nh\u1eb9 nh\u00e0ng h\u01a1n.")}
          </Text>
        </View>

        <Section title={tr("Gi\u1edbi thi\u1ec7u")}>
          <View className="p-4">
            <Text className="text-ink-soft text-sm leading-5">
              {tr("N\u1ec1n t\u1ea3ng \u0111\u1eb7t l\u1ecbch d\u1ecdn d\u1eb9p t\u1ea1i nh\u00e0. \u1ee8ng d\u1ee5ng gi\u00fap nh\u00e2n vi\u00ean nh\u1eadn vi\u1ec7c, theo d\u00f5i l\u1ecbch l\u00e0m v\u00e0 thu nh\u1eadp m\u1ed9t c\u00e1ch minh b\u1ea1ch.")}
            </Text>
            <View className="flex-row mt-4" style={{ gap: 8 }}>
              <Highlight icon="briefcase" label={tr("Nh\u1eadn vi\u1ec7c nhanh")} />
              <Highlight icon="calendar" label={tr("L\u1ecbch l\u00e0m r\u00f5 r\u00e0ng")} />
              <Highlight icon="trending-up" label={tr("Thu nh\u1eadp minh b\u1ea1ch")} />
            </View>
          </View>
        </Section>

        <Section title={tr("Li\u00ean h\u1ec7")}>
          <Row icon="mail" label="Email" value={EMAIL} onPress={() => open(`mailto:${EMAIL}`)} />
          <Row icon="message-circle" label="Zalo" value={ZALO} onPress={() => open(`https://zalo.me/${ZALO}`)} />
          <Row icon="clock" label={tr("Gi\u1edd h\u1ed7 tr\u1ee3")} value={tr("8:00 - 20:00 m\u1ed7i ng\u00e0y")} />
          <Row icon="map-pin" label={tr("\u0110\u1ecba ch\u1ec9")} value={tr("TP. H\u1ed3 Ch\u00ed Minh, Vi\u1ec7t Nam")} last />
        </Section>

        <Section title={tr("\u0110i\u1ec1u kho\u1ea3n & ch\u00ednh s\u00e1ch")}>
          <Row icon="file-text" label={tr("\u0110i\u1ec1u kho\u1ea3n d\u1ecbch v\u1ee5")} value={tr("S\u1eafp ra m\u1eaft.")} />
          <Row icon="shield" label={tr("Ch\u00ednh s\u00e1ch b\u1ea3o m\u1eadt")} value={tr("S\u1eafp ra m\u1eaft.")} last />
        </Section>

        <Text className="text-ink-muted text-xs text-center mt-6">
          {tr("\u00a9 2026 CleanWise. B\u1ea3o l\u01b0u m\u1ecdi quy\u1ec1n.")}
        </Text>
      </ScrollView>
    </View>
  );
}