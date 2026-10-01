import { COLORS, SHADOWS, TYPE } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef, type ComponentProps } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const BAR_HEIGHT = 72;
const BAR_RADIUS = 28; // bo 2 góc trên
const CIRCLE = 58; // đường kính nút giữa
const OVERHANG = 24; // nút giữa tràn lên trên thanh (không chiếm chỗ layout)
const NOTCH_HALF_WIDTH = 52;
const NOTCH_DEPTH = 36;

const CENTER_ROUTE = "chatbot";

const ICONS: Record<string, { on: IoniconName; off: IoniconName }> = {
  home: { on: "home", off: "home-outline" },
  jobs: { on: "clipboard", off: "clipboard-outline" },
  messages: { on: "chatbubble-ellipses", off: "chatbubble-ellipses-outline" },
  profile: { on: "person", off: "person-outline" },
};

function buildBarPath(width: number) {
  const cx = width / 2;
  const x1 = cx - NOTCH_HALF_WIDTH;
  const x2 = cx + NOTCH_HALF_WIDTH;
  const r = BAR_RADIUS;
  const h = BAR_HEIGHT;
  return [
    `M 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `L ${x1} 0`,
    `C ${x1 + 18} 0 ${cx - 34} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH}`,
    `C ${cx + 34} ${NOTCH_DEPTH} ${x2 - 18} 0 ${x2} 0`,
    `L ${width - r} 0`,
    `Q ${width} 0 ${width} ${r}`,
    `L ${width} ${h}`,
    `L 0 ${h}`,
    "Z",
  ].join(" ");
}

type ItemProps = {
  label: string;
  focused: boolean;
  badge?: string | number;
  routeName: string;
  width: number;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
};

/** Tab thường: icon nảy lên, viên thuốc nền hiện ra, nhấn thì co lại */
function TabItem({
  label,
  focused,
  badge,
  routeName,
  width,
  onPress,
  onLongPress,
  accessibilityLabel,
}: ItemProps) {
  const active = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(active, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [focused, active]);

  const pressTo = (v: number) =>
    Animated.spring(press, {
      toValue: v,
      useNativeDriver: true,
      damping: 14,
      stiffness: 300,
    }).start();

  const icon = ICONS[routeName];
  const iconName: IoniconName = icon
    ? focused
      ? icon.on
      : icon.off
    : "ellipse-outline";
  const tint = focused ? COLORS.ink : COLORS.inkMuted;

  const translateY = active.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const pillScale = active.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => pressTo(0.88)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel ?? label}
      style={{ width, height: BAR_HEIGHT, minHeight: 44 }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 8,
          alignSelf: "center",
          width: 54,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: press }, { translateY }],
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 54,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.accentLight,
            opacity: active,
            transform: [{ scale: pillScale }],
          }}
        />
        <Ionicons name={iconName} size={22} color={tint} />
        {badge !== undefined && badge !== "" && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: 2,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              borderRadius: 9,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: COLORS.surface,
            }}
          >
            <Text
              style={{ color: COLORS.white, fontSize: 10, fontWeight: "800" }}
            >
              {badge}
            </Text>
          </View>
        )}
      </Animated.View>

      <Text
        numberOfLines={1}
        style={[
          TYPE.label,
          {
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 11,
            color: tint,
            fontWeight: focused ? "800" : "600",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Nút giữa: nhấn thì nhún, chọn thì nảy và xoay nhẹ */
function CenterItem({
  label,
  focused,
  width,
  onPress,
  onLongPress,
  accessibilityLabel,
}: Omit<ItemProps, "badge" | "routeName">) {
  const press = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 9,
      stiffness: 160,
    }).start();
  }, [focused, pop]);

  const pressTo = (v: number) =>
    Animated.spring(press, {
      toValue: v,
      useNativeDriver: true,
      damping: 12,
      stiffness: 300,
    }).start();

  const rotate = pop.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const lift = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => pressTo(0.9)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel ?? label}
      style={{ width, height: BAR_HEIGHT, overflow: "visible" }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -OVERHANG,
            alignSelf: "center",
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE / 2,
            backgroundColor: COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: focused ? COLORS.primaryLight : COLORS.primary,
            transform: [{ scale: press }, { translateY: lift }],
          },
          SHADOWS.float,
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialCommunityIcons
            name={focused ? "robot-happy" : "robot-happy-outline"}
            size={28}
            color={COLORS.white}
          />
        </Animated.View>
      </Animated.View>

      <Text
        numberOfLines={1}
        style={[
          TYPE.label,
          {
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 11,
            color: focused ? COLORS.ink : COLORS.inkMuted,
            fontWeight: focused ? "800" : "600",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: barWidth } = useWindowDimensions();

  const visible = state.routes.map((route, index) => ({ route, index }));

  const slotWidth = barWidth / visible.length;
  const path = buildBarPath(barWidth);

  return (
    <View
      style={{
        backgroundColor: "transparent",
        height: BAR_HEIGHT + insets.bottom,
        overflow: "visible",
      }}
    >
      <View
        style={{ width: barWidth, height: BAR_HEIGHT, overflow: "visible" }}
      >
        {/* Nền thanh bo góc + bóng đổ hướng lên trên */}
        <Svg
          width={barWidth}
          height={BAR_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          <Path
            d={path}
            fill={COLORS.ink}
            fillOpacity={0.035}
            transform="translate(0,-4)"
          />
          <Path
            d={path}
            fill={COLORS.ink}
            fillOpacity={0.05}
            transform="translate(0,-2)"
          />
          <Path d={path} fill={COLORS.surface} />
        </Svg>

        <View
          style={{
            flexDirection: "row",
            height: BAR_HEIGHT,
            overflow: "visible",
          }}
        >
          {visible.map(({ route, index }) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const label =
              typeof options.title === "string" ? options.title : route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };
            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            if (route.name === CENTER_ROUTE) {
              return (
                <CenterItem
                  key={route.key}
                  label={label}
                  focused={focused}
                  width={slotWidth}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                />
              );
            }

            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                label={label}
                focused={focused}
                badge={options.tabBarBadge}
                width={slotWidth}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              />
            );
          })}
        </View>
      </View>

      {/* Vùng an toàn dưới đáy cùng màu với thanh */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom,
          backgroundColor: COLORS.surface,
        }}
      />
    </View>
  );
}
