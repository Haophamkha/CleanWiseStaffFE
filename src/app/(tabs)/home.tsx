import { ProfileStatusCard } from "@/components/common/ProfileStatusCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";
import { COLORS } from "@/constants/theme";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { ScheduleShortcut } from "@/features/home/components/ScheduleShortcut";
import { TodayScheduleCard } from "@/features/home/components/TodayScheduleCard";
import { TodaySummary } from "@/features/home/components/TodaySummary";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

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
    openSchedule,
    openJob,
    goAvailableJobs,
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

          <FadeInView delay={120}>
            <ScheduleShortcut onPress={openSchedule} />
          </FadeInView>

          <View className="px-5 pt-7 pb-8">
            <View className="flex-row items-center mb-4">
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
                onAction={goAvailableJobs}
              />
            ) : (
              todaySchedules.map((s, index) => (
                <FadeInView key={s.id} delay={200 + Math.min(index, 5) * 70}>
                  <TodayScheduleCard
                    schedule={s}
                    onPress={() => openJob(s.id)}
                  />
                </FadeInView>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
