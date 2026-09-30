import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { DaySummary } from "@/features/schedule/components/DaySummary";
import { ScheduleHero } from "@/features/schedule/components/ScheduleHero";
import { ScheduleTimelineItem } from "@/features/schedule/components/ScheduleTimelineItem";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

function ScheduleContent() {
  const s = useSchedule();

  return (
    <View className="flex-1 bg-canvas">
      <ScheduleHero
        monthLabel={s.monthLabel}
        yearLabel={s.yearLabel}
        days={s.days}
        onBack={s.goBack}
        onToday={s.goToday}
        onPrev={s.goPrevWeek}
        onNext={s.goNextWeek}
        onSelect={s.selectDay}
      />

      {s.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={s.isRefreshing}
              onRefresh={s.refresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{
            paddingTop: 24,
            paddingHorizontal: 20,
            paddingBottom: 32,
          }}
        >
          <DaySummary
            title={s.dayTitle}
            dateLabel={s.dateLabel}
            count={s.summary.count}
            hoursLabel={s.summary.hoursLabel}
            incomeLabel={s.summary.incomeLabel}
          />

          {s.rows.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Chưa có lịch làm"
              message='Ngày này chưa có ca làm việc. Sang tab "Khả dụng" để nhận thêm việc nhé.'
              actionLabel="Xem việc khả dụng"
              onAction={s.goAvailableJobs}
            />
          ) : (
            s.rows.map((row) => (
              <ScheduleTimelineItem
                key={row.id}
                row={row}
                onPress={s.openSchedule}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function ScheduleScreen() {
  return (
    <ActiveProfileGate>
      <ScheduleContent />
    </ActiveProfileGate>
  );
}
