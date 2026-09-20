import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
};

export function SimpleHeader({ title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="bg-white border-b border-[#F3F4F6]"
    >
      <View className="flex-row items-center justify-between px-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[#111827] text-base font-bold">{title}</Text>
        <View style={{ width: 22 }} />
      </View>
    </View>
  );
}
