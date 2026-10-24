import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { MenuGroup } from "@/features/profile/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileMenuProps = {
  groups: MenuGroup[];
};

export function ProfileMenu({ groups }: ProfileMenuProps) {
  const { COLORS } = useAppTheme();
  const ordered = [...groups.filter(group => group.layout === "shortcuts"), ...groups.filter(group => group.layout !== "shortcuts")];

  return (
    <View className="mx-5 mt-4">
      {ordered.map((group) => {
        const isList = group.layout === "list";
        const isShortcut = group.layout === "shortcuts";
        return <View key={group.layout} style={{ marginBottom: 14 }}>
          {!isShortcut && <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">{group.title}</Text>}
          <View
            className={isList ? "bg-surface overflow-hidden" : "flex-row"}
            style={isList ? { borderRadius: 18, paddingHorizontal: 12 } : { gap: 10 }}
          >
            {group.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                accessibilityRole="button"
                activeOpacity={0.7}
                disabled={!item.onPress}
                onPress={item.onPress}
                className={isList ? "flex-row items-center" : `flex-1 bg-surface ${isShortcut ? "border border-line" : "flex-row items-center justify-center"}`}
                style={isList ? { minHeight: 46, paddingVertical: 7, borderTopWidth: index ? 1 : 0, borderTopColor: COLORS.line } : { minHeight: isShortcut ? 80 : 48, padding: 12, borderRadius: isShortcut ? 18 : 12, justifyContent: "center" }}
              >
                <View className={isList ? "bg-surface-muted items-center justify-center" : ""}
                  style={isList ? { width: 30, height: 30, borderRadius: 9, marginRight: 10 } : undefined}>
                  <Feather name={item.icon} size={isList ? 16 : 18} color={isShortcut || item.icon === "settings" ? COLORS.primary : COLORS.inkSoft} />
                </View>
                <Text className="text-ink font-medium"
                  style={{ flex: isList ? 1 : undefined, fontSize: isList || isShortcut ? 13 : 12, lineHeight: 19, marginTop: isShortcut ? 8 : 0, marginLeft: group.layout === "support" ? 8 : 0 }}>
                  {item.label}
                </Text>
                {isList && item.onPress && (
                  <Feather name="chevron-right" size={16} color={COLORS.inkMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>;
      })}
    </View>
  );
}
