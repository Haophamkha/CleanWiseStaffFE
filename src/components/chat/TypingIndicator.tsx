import { useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { Animated, Image, Text, View } from "react-native";

export function TypingIndicator({ avatar }: { avatar?: string | null }) {
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    const animations = dots.map((dot, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 180),
      Animated.timing(dot, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.delay((2 - index) * 180 + 240),
    ])));
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dots]);

  return (
    <View className="px-4 mb-3 flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-[#E5E7EB] items-center justify-center overflow-hidden mr-2">
        {avatar
          ? <Image source={{ uri: avatar }} className="w-8 h-8" />
          : <Feather name="user" size={16} color="#6B7280" />}
      </View>
      <View className="flex-row items-center py-2">
        <Text className="text-xs mr-2 text-[#6B7280]">Đang soạn tin</Text>
        {dots.map((dot, index) => (
          <Animated.View key={index} style={{
            width: 5, height: 5, borderRadius: 3, backgroundColor: "#9CA3AF", marginHorizontal: 2,
            opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
            transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }} />
        ))}
      </View>
    </View>
  );
}
