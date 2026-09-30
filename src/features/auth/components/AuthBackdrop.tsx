import { COLORS } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, View, useWindowDimensions } from "react-native";

/* Giá trị 0 → 1 → 0 lặp vô hạn, êm như nhịp thở */
function useLoop(duration: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay]);

  return v;
}

type BlobProps = {
  size: number;
  color: string;
  opacity?: number;
  left?: number;
  right?: number;
  bottom: number;
  driftX?: number;
  driftY?: number;
  duration: number;
  delay?: number;
};

function Blob({
  size,
  color,
  opacity = 1,
  left,
  right,
  bottom,
  driftX = 0,
  driftY = 0,
  duration,
  delay,
}: BlobProps) {
  const t = useLoop(duration, delay);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        left,
        right,
        bottom,
        transform: [
          {
            translateX: t.interpolate({
              inputRange: [0, 1],
              outputRange: [0, driftX],
            }),
          },
          {
            translateY: t.interpolate({
              inputRange: [0, 1],
              outputRange: [0, driftY],
            }),
          },
        ],
      }}
    />
  );
}

const HEIGHT = 240;

export function AuthBackdrop() {
  const { width } = useWindowDimensions();

  const big = width * 1.25;
  const mid = width * 0.95;
  const small = width * 0.8;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: HEIGHT, overflow: "hidden" }}
    >
      {/* Lớp sau cùng: kem đậm, trôi chậm nhất */}
      <Blob
        size={big}
        color={COLORS.accentLight}
        left={-width * 0.1}
        bottom={-(big - 170)}
        driftX={18}
        driftY={-10}
        duration={6000}
      />
      {/* Lớp giữa: màu viền be */}
      <Blob
        size={mid}
        color={COLORS.line}
        opacity={0.75}
        left={-width * 0.3}
        bottom={-(mid - 120)}
        driftX={26}
        driftY={-14}
        duration={5000}
        delay={400}
      />
      {/* Lớp trước: tone da */}
      <Blob
        size={small}
        color={COLORS.accent}
        opacity={0.35}
        right={-width * 0.25}
        bottom={-(small - 100)}
        driftX={-22}
        driftY={-12}
        duration={4500}
        delay={800}
      />

      {/* Chấm điểm nhấn trôi lên xuống (đỏ chỉ dùng rất nhẹ) */}
      <Blob
        size={64}
        color={COLORS.primaryLight}
        right={width * 0.12}
        bottom={150}
        driftY={-16}
        duration={3800}
      />
      <Blob
        size={12}
        color={COLORS.primary}
        opacity={0.85}
        right={width * 0.22}
        bottom={195}
        driftY={-10}
        driftX={6}
        duration={3200}
        delay={300}
      />
      <Blob
        size={22}
        color={COLORS.accent}
        opacity={0.5}
        left={width * 0.14}
        bottom={160}
        driftY={-14}
        driftX={-6}
        duration={4200}
        delay={600}
      />
      <Blob
        size={10}
        color={COLORS.accentDark}
        opacity={0.4}
        left={width * 0.3}
        bottom={120}
        driftY={-8}
        duration={3000}
        delay={900}
      />
    </View>
  );
}
