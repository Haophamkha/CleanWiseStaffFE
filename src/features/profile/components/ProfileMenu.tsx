import type { MenuGroup } from "@/features/profile/hooks/useProfile";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileMenuProps = {
  groups: MenuGroup[];
};

export function ProfileMenu({ groups }: ProfileMenuProps) {
  const { COLORS, SHADOWS } = useAppTheme();
  const ordered = [
    ...groups.filter((g) => g.layout === "shortcuts"),
    ...groups.filter((g) => g.layout !== "shortcuts"),
  ];

  return (
    <View className="mx-5" style={{ marginTop: 18 }}>
      {ordered.map((group) => {
        const isShortcut = group.layout === "shortcuts";

        return (
          <View key={group.layout} style={{ marginBottom: 20 }}>
            {!isShortcut && !!group.title && (
              <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
                {group.title}
              </Text>
            )}

            {isShortcut ? (
              <View className="flex-row" style={{ gap: 12 }}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    disabled={!item.onPress}
                    onPress={item.onPress}
                    className="flex-1 bg-surface border border-line"
                    style={[
                      { borderRadius: 22, padding: 16, minHeight: 96 },
                      SHADOWS.card,
                    ]}
                  >
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: COLORS.primarySoft,
                      }}
                    >
                      <Feather
                        name={item.icon}
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text
                      className="text-ink font-semibold"
                      style={{ fontSize: 14, lineHeight: 20, marginTop: 10 }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View
                className="bg-surface border border-line overflow-hidden"
                style={{ borderRadius: 24 }}
              >
                {group.items.map((item, index) => (
                  <View key={item.label}>
                    {index > 0 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: COLORS.line,
                          marginLeft: 68,
                          marginRight: 16,
                        }}
                      />
                    )}
                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.6}
                      disabled={!item.onPress}
                      onPress={item.onPress}
                      className="flex-row items-center"
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        minHeight: 60,
                      }}
                    >
                      <View
                        className="items-center justify-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: COLORS.primarySoft,
                          marginRight: 12,
                        }}
                      >
                        <Feather
                          name={item.icon}
                          size={18}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text
                        className="flex-1 text-ink font-medium"
                        style={{ fontSize: 15, lineHeight: 21 }}
                      >
                        {item.label}
                      </Text>
                      {!!item.onPress && (
                        <Feather
                          name="chevron-right"
                          size={18}
                          color={COLORS.inkMuted}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
