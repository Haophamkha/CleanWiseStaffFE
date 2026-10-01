import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center px-3 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            className="items-center justify-center"
            style={{ width: 40, height: 44 }}
          >
            <Feather name="chevron-left" size={30} color={COLORS.ink} />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-ink text-base font-extrabold"
            style={{ letterSpacing: 0.3 }}
          >
            Về CleanWise
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-surface border border-line items-center px-6 py-8"
          style={[{ borderRadius: RADIUS.hero }, SHADOWS.card]}
        >
          <View
            className="bg-ink items-center justify-center"
            style={{ width: 72, height: 72, borderRadius: 24 }}
          >
            <Feather name="home" size={30} color={COLORS.white} />
          </View>
          <Text className="text-ink text-xl font-extrabold mt-4">
            CleanWise Staff
          </Text>
          <Text className="text-ink-muted text-sm mt-1">Phiên bản 1.0.0</Text>
          <Text className="text-ink-soft text-sm leading-5 text-center mt-4">
            Thông tin giới thiệu về CleanWise sẽ được cập nhật sớm.
          </Text>
        </View>

        <View
          className="bg-surface border border-line mt-4 px-5 py-4"
          style={{ borderRadius: RADIUS.card }}
        >
          <Text className="text-ink font-extrabold text-base">
            Điều khoản & chính sách
          </Text>
          <Text className="text-ink-muted text-sm mt-1">Sắp ra mắt.</Text>
        </View>

        <View
          className="bg-surface border border-line mt-3 px-5 py-4"
          style={{ borderRadius: RADIUS.card }}
        >
          <Text className="text-ink font-extrabold text-base">Liên hệ</Text>
          <Text className="text-ink-muted text-sm mt-1">Sắp ra mắt.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
