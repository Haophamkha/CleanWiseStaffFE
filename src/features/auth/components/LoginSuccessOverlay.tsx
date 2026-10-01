import { COLORS, ON_DARK, TYPE } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  visible: boolean;
  name?: string;
  onFinish: () => void;
  durationMs?: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const STAGE = 320;
const C = STAGE / 2;
const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;
const CHECK_PATH =
  "M" +
  (C - 26) +
  " " +
  (C + 2) +
  " L" +
  (C - 8) +
  " " +
  (C + 20) +
  " L" +
  (C + 26) +
  " " +
  (C - 18);
const CHECK_LENGTH = 90;
const STAR_PATH =
  "M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z";

const CONFETTI_COLORS = [
  COLORS.primary,
  COLORS.accent,
  ON_DARK.text,
  COLORS.accentLight,
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 2) * 0.18;
  const dist = 92 + (i % 4) * 16;
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    w: i % 3 === 0 ? 6 : 8,
    h: i % 3 === 0 ? 6 : 14,
    round: i % 3 === 0,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    spin: (i % 2 === 0 ? 1 : -1) * (160 + i * 24),
  };
});

const SPARKLES = [
  { left: "12%", top: "14%", size: 22, color: COLORS.accent, alt: false },
  { left: "80%", top: "10%", size: 16, color: ON_DARK.text, alt: true },
  { left: "88%", top: "34%", size: 12, color: COLORS.primary, alt: false },
  { left: "6%", top: "40%", size: 14, color: ON_DARK.text, alt: true },
  { left: "20%", top: "76%", size: 18, color: COLORS.primary, alt: true },
  { left: "84%", top: "72%", size: 24, color: COLORS.accent, alt: false },
  { left: "52%", top: "8%", size: 10, color: COLORS.accentLight, alt: true },
  { left: "60%", top: "86%", size: 12, color: ON_DARK.text, alt: false },
] as const;

const DOTS = [
  { left: "28%", top: "22%", size: 6, color: COLORS.primary },
  { left: "72%", top: "22%", size: 5, color: COLORS.accent },
  { left: "16%", top: "58%", size: 5, color: COLORS.accent },
  { left: "90%", top: "56%", size: 6, color: COLORS.primary },
  { left: "36%", top: "84%", size: 5, color: ON_DARK.text },
  { left: "74%", top: "90%", size: 6, color: COLORS.primary },
  { left: "44%", top: "14%", size: 4, color: ON_DARK.text },
] as const;

export function LoginSuccessOverlay({
  visible,
  name,
  onFinish,
  durationMs = 2000,
}: Props) {
  const ring = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const deco = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!visible) return;
    [ring, fill, tick, burst, text, progress, deco, pulse, spin].forEach((v) =>
      v.setValue(0),
    );

    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ];
    loops.forEach((l) => l.start());

    Animated.parallel([
      Animated.timing(deco, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ring, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(450),
        Animated.spring(fill, {
          toValue: 1,
          damping: 11,
          stiffness: 160,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(tick, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(burst, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(text, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();

    const t = setTimeout(() => finishRef.current(), durationMs);
    return () => {
      clearTimeout(t);
      loops.forEach((l) => l.stop());
    };
  }, [
    visible,
    durationMs,
    ring,
    fill,
    tick,
    burst,
    text,
    progress,
    deco,
    pulse,
    spin,
  ]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View
        className="flex-1 items-center justify-center bg-ink px-8"
        style={{ backgroundColor: COLORS.ink }}
      >
        {/* Cung tròn lớn ở 2 góc */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -110,
            right: -110,
            width: 280,
            height: 280,
            borderRadius: 140,
            borderWidth: 1.5,
            borderColor: ON_DARK.surface,
            opacity: deco,
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: COLORS.inkPanel,
            opacity: deco,
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -130,
            left: -130,
            width: 320,
            height: 320,
            borderRadius: 160,
            borderWidth: 1.5,
            borderColor: ON_DARK.surface,
            opacity: deco,
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -70,
            left: -70,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: COLORS.inkPanel,
            opacity: deco,
          }}
        />

        {/* Chấm rải rác */}
        {DOTS.map((d, i) => (
          <Animated.View
            key={`dot-${i}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              backgroundColor: d.color,
              opacity: deco.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
            }}
          />
        ))}

        {/* Sao nhấp nháy */}
        {SPARKLES.map((s, i) => {
          const p = s.alt
            ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
            : pulse;
          return (
            <Animated.View
              key={`star-${i}`}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: s.left,
                top: s.top,
                opacity: Animated.multiply(
                  deco,
                  p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                ),
                transform: [
                  {
                    scale: p.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1.15],
                    }),
                  },
                ],
              }}
            >
              <Svg width={s.size} height={s.size} viewBox="-10 -10 20 20">
                <Path d={STAR_PATH} fill={s.color} />
              </Svg>
            </Animated.View>
          );
        })}

        {/* Khu vực huy hiệu + họa tiết quanh */}
        <View
          className="items-center justify-center"
          style={{ width: STAGE, height: STAGE }}
        >
          {/* Vòng mờ đồng tâm */}
          <Animated.View
            pointerEvents="none"
            style={{ position: "absolute", opacity: deco }}
          >
            <Svg width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`}>
              <Circle
                cx={C}
                cy={C}
                r={84}
                stroke={ON_DARK.surface}
                strokeWidth={1.5}
                fill="none"
              />
              <Circle
                cx={C}
                cy={C}
                r={148}
                stroke={ON_DARK.surface}
                strokeWidth={1.5}
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Vòng nét đứt xoay chậm */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              opacity: deco,
              transform: [{ rotate }],
            }}
          >
            <Svg width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`}>
              <Circle
                cx={C}
                cy={C}
                r={116}
                stroke={COLORS.accent}
                strokeWidth={1.5}
                strokeDasharray="3 12"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Mảnh nổ ra */}
          {PARTICLES.map((p, i) => (
            <Animated.View
              key={`p-${i}`}
              pointerEvents="none"
              style={{
                position: "absolute",
                width: p.w,
                height: p.h,
                borderRadius: p.round ? p.w / 2 : 2,
                backgroundColor: p.color,
                opacity: burst.interpolate({
                  inputRange: [0, 0.15, 0.75, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, p.dx],
                    }),
                  },
                  {
                    translateY: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, p.dy],
                    }),
                  },
                  {
                    rotate: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", `${p.spin}deg`],
                    }),
                  },
                ],
              }}
            />
          ))}

          {/* Nền đỏ bật lên sau khi vòng vẽ xong */}
          <Animated.View
            style={{
              position: "absolute",
              width: R * 2,
              height: R * 2,
              borderRadius: R,
              backgroundColor: COLORS.primary,
              transform: [{ scale: fill }],
            }}
          />
          <Svg
            width={STAGE}
            height={STAGE}
            viewBox={`0 0 ${STAGE} ${STAGE}`}
            style={{ position: "absolute" }}
          >
            <AnimatedCircle
              cx={C}
              cy={C}
              r={R}
              stroke={COLORS.accent}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ring.interpolate({
                inputRange: [0, 1],
                outputRange: [CIRCUMFERENCE, 0],
              })}
              rotation={-90}
              origin={`${C}, ${C}`}
            />
            <AnimatedPath
              d={CHECK_PATH}
              stroke={COLORS.white}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LENGTH}
              strokeDashoffset={tick.interpolate({
                inputRange: [0, 1],
                outputRange: [CHECK_LENGTH, 0],
              })}
            />
          </Svg>
        </View>

        <Animated.View
          className="items-center"
          style={{
            marginTop: -24,
            opacity: text,
            transform: [
              {
                translateY: text.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <Text
            className="text-xs"
            style={[TYPE.label, { letterSpacing: 1.5, color: COLORS.accent }]}
          >
            ĐĂNG NHẬP THÀNH CÔNG
          </Text>
          <Text
            className="text-2xl font-extrabold mt-2 text-center"
            style={{ color: ON_DARK.text }}
          >
            {name ? `Chào mừng trở lại, ${name}` : "Chào mừng trở lại"}
          </Text>
          <Text
            className="text-sm mt-1.5 text-center"
            style={{ color: ON_DARK.textSoft }}
          >
            Chúc bạn một ngày làm việc thuận lợi.
          </Text>
        </Animated.View>

        <View
          className="absolute rounded-full overflow-hidden"
          style={{
            left: 40,
            right: 40,
            bottom: 56,
            height: 4,
            backgroundColor: ON_DARK.surface,
          }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={{
              backgroundColor: COLORS.accent,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
