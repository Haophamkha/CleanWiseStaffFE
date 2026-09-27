import { AppNotification } from "@/types/Notification";
import { getNotificationTypeMeta } from "@/utils/notificationMeta";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

function formatTime(iso: string) {
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
  const isUnread = !notification.is_read;

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      className={`flex-row bg-white rounded-2xl p-4 mb-3 border border-[#F3F4F6] ${
        isUnread ? "border-l-4 border-l-[#2563EB]" : ""
      }`}
    >
      <View
        className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
          isUnread ? "bg-[#EEF2FF]" : "bg-[#F3F4F6]"
        }`}
      >
        {meta.iconLibrary === "material-community" ? (
          <MaterialCommunityIcons
            name={meta.iconName as any}
            size={20}
            color={isUnread ? "#2563EB" : "#6B7280"}
          />
        ) : (
          <Feather
            name={meta.iconName as any}
            size={18}
            color={isUnread ? "#2563EB" : "#6B7280"}
          />
        )}
      </View>

      <View className="flex-1">
        <Text
          className={`text-[#111827] text-[15px] mb-1 ${
            isUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {notification.title}
        </Text>
        <Text className="text-[#6B7280] text-sm leading-5" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-[#9CA3AF] text-xs mt-2 text-right">
          {formatTime(notification.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
