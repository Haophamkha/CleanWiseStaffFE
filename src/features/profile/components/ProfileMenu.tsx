import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import type { MenuGroup } from "@/features/profile/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileMenuProps = {
  groups: MenuGroup[];
};

export function ProfileMenu({ groups }: ProfileMenuProps) {
  const items = groups.flatMap((g) => g.items);

  return (
    <View
      className="mx-5 mt-5"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View
        className="bg-surface border border-line overflow-hidden"
        style={{ borderRadius: RADIUS.card }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            disabled={!item.onPress}
            onPress={item.onPress}
            className={`flex-row items-center px-5 ${
              index !== items.length - 1 ? "border-b border-line" : ""
            }`}
            style={{ minHeight: 62 }}
          >
            <Feather name={item.icon} size={22} color={COLORS.ink} />
            <Text className="flex-1 text-ink text-base font-medium ml-4">
              {item.label}
            </Text>
            {item.onPress && (
              <Feather name="chevron-right" size={20} color={COLORS.ink} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
