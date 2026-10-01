import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function ProfileSetupSuccess() {
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
    >
      <View
        className="w-full max-w-[420px] bg-surface border border-line p-7 items-center"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        <View className="w-20 h-20 rounded-full bg-accent-light items-center justify-center mb-6">
          <Feather name="check" size={38} color={COLORS.ink} />
        </View>

        <Text className="text-ink text-2xl font-extrabold text-center mb-3">
          Hồ sơ đã được gửi
        </Text>
        <View className="bg-accent-light rounded-full px-4 py-1.5 mb-4">
          <Text className="text-ink-soft text-xs font-semibold">
            Chờ xét duyệt
          </Text>
        </View>
        <Text className="text-ink-soft text-[15px] leading-6 text-center mb-5">
          Cảm ơn bạn đã đăng ký làm nhân viên của CleanCare. Quản trị viên sẽ
          xem xét hồ sơ trong vòng{" "}
          <Text className="font-extrabold text-ink">24 - 48 giờ</Text>.
        </Text>

        <View className="flex-row items-start bg-canvas rounded-2xl px-4 py-3 mb-7 self-stretch">
          <Feather
            name="bell"
            size={16}
            color={COLORS.ink}
            style={{ marginTop: 2, marginRight: 10 }}
          />
          <Text className="text-ink-soft text-[13px] leading-5 flex-1">
            Kết quả duyệt hồ sơ sẽ được thông báo ngay trong ứng dụng. Bạn không
            cần kiểm tra email hay tin nhắn.
          </Text>
        </View>

        <View className="self-stretch" style={{ gap: 10 }}>
          <PrimaryButton
            label="Về trang chủ"
            variant="dark"
            onPress={() => router.replace("/(tabs)/home")}
          />
          <PrimaryButton
            label="Xem lại hồ sơ"
            variant="outline"
            onPress={() => router.push("/(profile-setup)/personal-info")}
          />
        </View>
      </View>
    </ScrollView>
  );
}
