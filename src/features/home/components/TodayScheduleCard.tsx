import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS, ON_DARK, RADIUS, SHADOWS } from "@/constants/theme";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import { formatDuration } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

type TodayScheduleCardProps = {
  schedule: WorkerMySchedule;
  onPress: () => void;
};

export function TodayScheduleCard({
  schedule: s,
  onPress,
}: TodayScheduleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface p-4 mb-4 border border-line"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-start">
        {/* Ô mốc giờ */}
        <View
          className="bg-ink-panel rounded-2xl items-center justify-center px-3 py-2.5 mr-3"
          style={{ minWidth: 70 }}
        >
          <Text className="text-white text-xl font-extrabold">
            {formatTime(s.scheduled_start)}
          </Text>
          <View
            style={{
              width: 16,
              height: 1,
              marginVertical: 3,
              backgroundColor: ON_DARK.border,
            }}
          />
          <Text
            className="text-xs font-bold"
            style={{ color: ON_DARK.textSoft }}
          >
            {formatTime(s.scheduled_end)}
          </Text>
        </View>

        <View className="flex-1">
          <View className="self-start">
            <StatusBadge status={s.status} />
          </View>
          <Text
            className="text-ink text-base font-extrabold mt-2"
            numberOfLines={2}
          >
            {s.service_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={13} color={COLORS.inkMuted} />
            <Text className="text-ink-soft text-xs ml-1.5">
              {formatDuration(s.scheduled_start, s.scheduled_end)}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mt-4 pt-4 border-t border-line">
        <View className="w-8 h-8 rounded-full bg-accent-light items-center justify-center mr-2.5">
          <Feather name="map-pin" size={15} color={COLORS.accentDark} />
        </View>
        <Text className="flex-1 text-ink-soft text-sm" numberOfLines={2}>
          {s.address_ward ? `${s.address_ward}, ` : ""}
          {s.address_city}
        </Text>
        <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
      </View>
    </Pressable>
  );
}
