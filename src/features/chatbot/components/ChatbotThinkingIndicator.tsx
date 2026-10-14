import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export function ChatbotThinkingIndicator() {
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 180),
        Animated.timing(d, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.delay((2 - i) * 180 + 240),
      ])),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-8 h-8 rounded-xl bg-primary-light items-center justify-center mr-2">
        <MaterialCommunityIcons name="robot-happy-outline" size={21} color={COLORS.primaryDark} />
      </View>
      <View accessible accessibilityLabel="Đang suy nghĩ" className="flex-row items-center rounded-2xl bg-surface border border-line px-4 py-3">
        <Text className="text-ink-soft text-xs mr-2">Đang suy nghĩ</Text>
        {dots.map((d, i) => (
          <Animated.View key={i} style={{
            width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.inkMuted, marginHorizontal: 2,
            opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
            transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }} />
        ))}
      </View>
    </View>
  );
}
