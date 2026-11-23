import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ProfileStatusCard } from "@/components/common/ProfileStatusCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";

import { HomeHeader } from "@/features/home/components/HomeHeader";
import { ScheduleShortcut } from "@/features/home/components/ScheduleShortcut";
import { TodayScheduleCard } from "@/features/home/components/TodayScheduleCard";
import { TodaySummary } from "@/features/home/components/TodaySummary";
import { useHomeData } from "@/features/home/hooks/useHomeData";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

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
            count={todaySchedules.length}
          />
          <TodaySummary {...stats} />

          <FadeInView delay={120}>
            <ScheduleShortcut onPress={openSchedule} />
          </FadeInView>

          <View className="px-5 pt-7 pb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-5 rounded-full bg-ink-panel mr-2.5" />
              <Text className="text-ink text-lg font-extrabold">
                {tr("Công việc hôm nay")}</Text>
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
                title={tr("Hôm nay bạn chưa có việc")}
                message={tr("Sang tab \"Công việc\" để nhận thêm việc nhé")}
                actionLabel={tr("Xem việc có thể nhận")}
                onAction={goAvailableJobs}
              />
            ) : (
              todaySchedules.map((s, index) => (
                <FadeInView key={s.id} delay={200 + Math.min(index, 5) * 70}>
                  <View className="flex-row">
                    <View className="items-center mr-3" style={{ width: 14 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, marginTop: 24, backgroundColor: COLORS.primaryFill, borderWidth: 3, borderColor: COLORS.accentLight }} />
                      {index < todaySchedules.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: COLORS.line }} />}
                    </View>
                    <View className="flex-1">
                      
<TodayScheduleCard
                    schedule={s}
                    onPress={() => openJob(s.id)}
                  />
                    </View>
                  </View>
                </FadeInView>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
