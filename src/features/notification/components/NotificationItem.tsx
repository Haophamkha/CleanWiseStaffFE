import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type {
  AppNotification,
  NotificationType,
} from "@/features/notification/types/Notification";
import { getNotificationTypeMeta } from "@/features/notification/utils/notificationMeta";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

type Tone = { bg: string; fg: string };

/* Mỗi loại một màu nhẹ, lấy từ token */
const TONES: Record<NotificationType, Tone> = {
  BOOKING: { bg: COLORS.infoLight, fg: COLORS.info },
  PAYMENT: { bg: COLORS.successLight, fg: COLORS.success },
  ASSIGNMENT: { bg: COLORS.accentLight, fg: COLORS.accentDark },
  COMPLAINT: { bg: COLORS.warningLight, fg: COLORS.warning },
  SYSTEM: { bg: COLORS.primaryLight, fg: COLORS.primary },
};

function formatAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour)
    return `${Math.max(1, Math.floor(diffMs / minute))} phút trước`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ trước`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const meta = getNotificationTypeMeta(notification.type);
  const tone = TONES[notification.type] ?? TONES.SYSTEM;
  const isUnread = !notification.is_read;
  const iconColor = isUnread ? tone.fg : COLORS.inkMuted;

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      activeOpacity={0.75}
      className={`flex-row bg-surface border p-4 mb-3 ${
        isUnread ? "border-primary-border" : "border-line"
      }`}
      style={[{ borderRadius: RADIUS.card }, isUnread ? SHADOWS.card : null]}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3.5"
        style={{ backgroundColor: isUnread ? tone.bg : COLORS.accentLight }}
      >
        {meta.iconLibrary === "material-community" ? (
          <MaterialCommunityIcons
            name={meta.iconName as any}
            size={22}
            color={iconColor}
          />
        ) : (
          <Feather name={meta.iconName as any} size={20} color={iconColor} />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-xs"
            style={[TYPE.label, { color: iconColor, letterSpacing: 0.6 }]}
          >
            {meta.label.toUpperCase()}
          </Text>
          <View className="flex-row items-center">
            {isUnread && (
              <View className="w-2 h-2 rounded-full bg-primary mr-1.5" />
            )}
            <Text className="text-ink-muted text-xs">
              {formatAgo(notification.created_at)}
            </Text>
          </View>
        </View>

        <Text
          className={`text-ink text-[15px] mb-1 ${
            isUnread ? "font-extrabold" : "font-semibold"
          }`}
          numberOfLines={2}
        >
          {notification.title}
        </Text>
        <Text className="text-ink-soft text-sm leading-5" numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
