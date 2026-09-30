import { ON_DARK, RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DetailHeaderProps = { title: string; onBack: () => void };

/** Header hero đen cho các màn chi tiết (không nằm trong tab). */
export function DetailHeader({ title, onBack }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-ink px-5 pb-5 flex-row items-center"
      style={{
        paddingTop: insets.top + 8,
        borderBottomLeftRadius: RADIUS.hero,
        borderBottomRightRadius: RADIUS.hero,
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={8}
        className="w-11 h-11 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: ON_DARK.surface }}
      >
        <Feather name="arrow-left" size={20} color={ON_DARK.text} />
      </Pressable>
      <Text
        className="flex-1 text-xl font-extrabold"
        style={{ color: ON_DARK.text }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
