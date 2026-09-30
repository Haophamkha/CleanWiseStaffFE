import { ProfileStatusCard } from "@/components/common/ProfileStatusCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { TodayScheduleCard } from "@/features/home/components/TodayScheduleCard";
import { TodaySummary } from "@/features/home/components/TodaySummary";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const {
    profile,
    isLoading,
    isActive,
    isLoadingSchedules,
    todaySchedules,
    stats,
    workerName,
    workerAvatar,
    openDirections,
  } = useHomeData();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      showsVerticalScrollIndicator={false}
    >
      {isLoading || !profile ? (
        <View className="items-center justify-center py-24">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : !isActive ? (
        <>
          <HomeHeader variant="brand" />
          <ProfileStatusCard profile={profile} />
        </>
      ) : (
        <>
          <HomeHeader
            variant="greeting"
            name={workerName}
            avatar={workerAvatar}
          />
          <TodaySummary {...stats} />

          <View className="px-5 pt-7 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-ink text-lg font-extrabold">
                  Công việc hôm nay
                </Text>
                {todaySchedules.length > 0 && (
                  <View className="bg-accent-light rounded-full px-2.5 py-0.5 ml-2">
                    <Text className="text-ink text-xs font-bold">
                      {todaySchedules.length}
                    </Text>
                  </View>
                )}
              </View>
              <Pressable
                onPress={() => router.push("/schedule")}
                className="flex-row items-center py-2"
                hitSlop={8}
              >
                <Text className="text-primary text-sm font-bold">
                  Xem tất cả
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>

            {isLoadingSchedules ? (
              <View className="items-center py-8">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : todaySchedules.length === 0 ? (
              <EmptyState
                icon="coffee"
                title="Hôm nay bạn chưa có việc"
                message='Sang tab "Công việc" để nhận thêm việc nhé'
                actionLabel="Xem việc có thể nhận"
                onAction={() => router.push("/(tabs)/jobs")}
              />
            ) : (
              todaySchedules.map((s) => (
                <TodayScheduleCard
                  key={s.id}
                  schedule={s}
                  onPress={() =>
                    router.push({
                      pathname: "/jobs/[id]",
                      params: { id: String(s.id), source: "mine" },
                    })
                  }
                  onDirections={() => openDirections(s)}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
