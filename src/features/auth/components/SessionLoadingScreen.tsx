import { ON_DARK } from "@/constants/theme";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import Feather from "@expo/vector-icons/Feather";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, BackHandler, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

const CREAM = "#FFF1CB";
export const SESSION_LOADING_TIMING = {
  minimumLoading: 1000,
  successHold: 1100,
  fadeIn: 300,
} as const;
const FONT = Platform.select({ android: "sans-serif", ios: "System", default: "system-ui" });
const darken = (hex: string, ratio: number) => "#" + [1, 3, 5].map((offset) =>
  Math.round(parseInt(hex.slice(offset, offset + 2), 16) * ratio).toString(16).padStart(2, "0")
).join("");

const dots = [
  { x: "27%", y: "18%" }, { x: "68%", y: "18%" }, { x: "17%", y: "47%" },
  { x: "82%", y: "47%" }, { x: "22%", y: "69%" }, { x: "56%", y: "76%" },
] as const;
const stars = [
  { x: "13%", y: "13%", size: 19 }, { x: "86%", y: "11%", size: 12 },
  { x: "80%", y: "25%", size: 15 }, { x: "10%", y: "31%", size: 10 },
  { x: "79%", y: "51%", size: 23 }, { x: "76%", y: "70%", size: 12 },
] as const;

export function SessionLoadingScreen({ error, onRetry, success = false, onComplete, mode = "restore" }: {
  error: boolean;
  onRetry: () => void;
  success?: boolean;
  onComplete?: () => void;
  mode?: "restore" | "login";
}) {
  const { t } = useTranslation();
  const { COLORS, isDark } = useAppTheme();
  const tint = isDark ? COLORS.primary : COLORS.primaryLight;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const stage = Math.min(width * 0.72, height * 0.34, 320);
  const motion = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const loadingSince = useRef(Date.now());
  const completeRef = useRef(onComplete);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const entrance = Animated.timing(opacity, {
      toValue: 1, duration: SESSION_LOADING_TIMING.fadeIn, useNativeDriver: true,
    });
    entrance.start();
    return () => entrance.stop();
  }, [opacity]);

  useEffect(() => {
    if (!success || error) {
      loadingSince.current = Date.now();
      setShowSuccess(false);
      return;
    }
    const remaining = Math.max(0, SESSION_LOADING_TIMING.minimumLoading - (Date.now() - loadingSince.current));
    const timer = setTimeout(() => setShowSuccess(true), remaining);
    return () => clearTimeout(timer);
  }, [success, error, opacity]);

  useEffect(() => {
    if (error || showSuccess) return;
    const loop = Animated.loop(Animated.timing(motion, {
      toValue: 1, duration: 6500, easing: Easing.linear, useNativeDriver: true,
      isInteraction: false,
    }));
    loop.start();
    return () => { loop.stop(); };
  }, [motion, error, showSuccess]);

  useEffect(() => {
    if (!showSuccess || error) return;
    badgeScale.setValue(0.86);
    const badge = Animated.spring(badgeScale, {
      toValue: 1, damping: 13, stiffness: 150, useNativeDriver: true,
    });
    badge.start();
    const timer = setTimeout(() => {
      completeRef.current?.();
    }, SESSION_LOADING_TIMING.successHold);
    return () => { clearTimeout(timer); badge.stop(); };
  }, [showSuccess, error, badgeScale]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? COLORS.canvas : darken(COLORS.primaryFillDark, 0.7) }}>
    <Animated.View style={{ flex: 1, opacity }}>
    <LinearGradient
      colors={[isDark ? COLORS.canvas : darken(COLORS.primaryFillDark, 0.7), darken(COLORS.primaryFillDark, 0.8), COLORS.primaryFillDark]}
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 + height * 0.05 }]}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={[styles.corner, { top: -110, right: -100 }]} />
      <View pointerEvents="none" style={[styles.corner, { bottom: -140, left: -120, width: 340, height: 340, borderRadius: 170 }]} />
      {stars.map((star, i) => (
        <View key={i} pointerEvents="none" style={{ position: "absolute", left: star.x, top: star.y, opacity: 0.6 }}>
          <Svg width={star.size} height={star.size} viewBox="-10 -10 20 20">
            <Path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill={i % 4 === 0 ? CREAM : i % 2 ? tint : COLORS.primary} />
          </Svg>
        </View>
      ))}
      {dots.map((dot, i) => <View key={`dot-${i}`} pointerEvents="none" style={{ position: "absolute", left: dot.x, top: dot.y, width: 3, height: 3, borderRadius: 2, backgroundColor: i % 2 ? CREAM : tint }} />)}
      <Text style={styles.brand}>CleanWise<Text style={{ color: tint }}>.</Text></Text>
      <ScrollView style={styles.contentScroll} contentContainerStyle={[styles.content, { paddingBottom: Math.max(16, height * 0.075) }]} showsVerticalScrollIndicator={false} accessibilityLiveRegion="polite">
        <View style={{ width: stage, height: stage, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={stage} height={stage} viewBox="0 0 320 320" style={StyleSheet.absoluteFill}>
            <Circle cx={160} cy={160} r={147} stroke={ON_DARK.text} strokeOpacity={0.12} fill="none" />
            <Circle cx={160} cy={160} r={87} stroke={ON_DARK.text} strokeOpacity={0.17} fill="none" />
          </Svg>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
            <Svg width={stage} height={stage} viewBox="0 0 320 320">
              <Circle cx={160} cy={160} r={119} stroke={CREAM} strokeWidth={1.5} strokeDasharray="3 12" strokeLinecap="round" fill="none" />
              <Circle cx={279} cy={160} r={4} fill={CREAM} />
            </Svg>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryFill, COLORS.primaryFillDark]} style={[styles.badge, { borderColor: tint, width: stage * 0.4, height: stage * 0.4, borderRadius: stage }]}>
            <Feather name={error ? "wifi-off" : showSuccess ? "check" : "home"} size={stage * 0.16} color={ON_DARK.text} />
          </LinearGradient>
          </Animated.View>
        </View>
        <Text style={[styles.eyebrow, { color: CREAM }]}>{showSuccess ? t("SẴN SÀNG") : t("CHÀO MỪNG TRỞ LẠI")}</Text>
        <Text style={styles.title}>{error ? t("Kết nối đang gián đoạn") : showSuccess ? t("Chào mừng trở lại") : t("Một chút nữa là sẵn sàng")}</Text>
        <Text style={styles.subtitle}>
          {error ? t("Chưa thể khôi phục phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại.") : showSuccess ? t("Mọi thứ đã sẵn sàng. Cùng vào CleanWise nhé!") : mode === "login" ? t("Đang chuẩn bị không gian của bạn...") : t("Đang khôi phục phiên đăng nhập của bạn...")}
        </Text>
        {error && <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.retry} activeOpacity={0.8}>
          <Feather name="refresh-cw" color={COLORS.primaryFillDark} size={17} />
          <Text style={[styles.retryText, { color: COLORS.primaryFillDark }]}>{t("Thử lại")}</Text>
        </TouchableOpacity>}
      </ScrollView>
      <View style={styles.footer}>
        {!error && <View style={styles.loading} accessibilityRole={showSuccess ? "text" : "progressbar"} accessibilityLabel={showSuccess ? t("Kết nối thành công") : t("Đang khôi phục phiên đăng nhập của bạn...")}>
          {showSuccess ? <Feather name="check-circle" color={tint} size={20} /> : <ActivityIndicator color={tint} size="small" />}
          <Text style={styles.loadingText}>{showSuccess ? t("Kết nối thành công") : t("Đang kết nối an toàn")}</Text>
        </View>}
        <View style={styles.divider} />
        <Text style={[styles.tagline, { color: tint }]}>{t("Nhà sạch hơn, cuộc sống nhẹ nhàng hơn.")}</Text>
      </View>
    </LinearGradient>
    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", paddingHorizontal: 24, overflow: "hidden" },
  corner: { position: "absolute", width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  brand: { fontFamily: FONT, color: ON_DARK.text, fontWeight: "800", fontSize: 22, letterSpacing: -0.6 },
  contentScroll: { flex: 1, width: "100%" },
  content: { flexGrow: 1, alignItems: "center", justifyContent: "center", width: "100%", paddingVertical: 16 },
  badge: { alignItems: "center", justifyContent: "center", borderWidth: 3 },
  eyebrow: { fontFamily: FONT, fontSize: 10, fontWeight: "700", letterSpacing: 2.3, marginTop: 4, textAlign: "center" },
  title: { fontFamily: FONT, color: ON_DARK.text, fontSize: 24, fontWeight: "800", textAlign: "center", marginTop: 12, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONT, color: ON_DARK.textSoft, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 10, maxWidth: 300 },
  footer: { width: "100%", maxWidth: 320, alignItems: "center", gap: 16 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { fontFamily: FONT, color: ON_DARK.textSoft, fontSize: 12 },
  divider: { width: "100%", height: 2, borderRadius: 2, backgroundColor: CREAM },
  tagline: { fontFamily: FONT, fontSize: 11, textAlign: "center" },
  retry: { marginTop: 22, backgroundColor: ON_DARK.text, borderRadius: 28, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", gap: 10, alignItems: "center" },
  retryText: { fontFamily: FONT, fontSize: 14, fontWeight: "700" },
});
