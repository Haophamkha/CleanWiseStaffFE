import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Image, View } from "react-native";

type ChatAvatarProps = { uri?: string | null; size?: number };

export function ChatAvatar({ uri, size = 32 }: ChatAvatarProps) {
  return (
    <View
      className="rounded-full bg-accent-light items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Feather
          name="user"
          size={Math.round(size * 0.5)}
          color={COLORS.accentDark}
        />
      )}
    </View>
  );
}
