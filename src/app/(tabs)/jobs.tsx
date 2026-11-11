import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { PressableScale } from "@/components/ui/PressableScale";
import { useGetDisciplineQuery } from "@/features/complaint/api/disciplineApi";
import { AvailableJobsList } from "@/features/job/components/AvailableJobsList";
import { JobsHeader } from "@/features/job/components/JobsHeader";
import { MyJobsList } from "@/features/job/components/MyJobsList";
import { SortBar } from "@/features/job/components/SortBar";
import { useJobs } from "@/features/job/hooks/useJobs";
import { formatDateTime } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

function JobsContent() {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const jobs = useJobs();
  const { currentData } = useGetDisciplineQuery(1, {
    skip: jobs.tab !== "available",
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const discipline = currentData?.summary;
  const restriction = discipline?.can_claim === false
    ? discipline.status === "BANNED"
      ? t("Hồ sơ đã bị cấm nhận việc.")
      : discipline.restricted_until && t("Tạm dừng nhận việc mới đến {{time}}", {
          time: formatDateTime(discipline.restricted_until, t),
        })
    : null;
  const hasJobs = jobs.tab === "available" ? jobs.available.hasItems : jobs.mine.hasItems;
  const distanceAction = !jobs.location && hasJobs ? (
    <PressableScale
      accessibilityRole="button"
      disabled={jobs.isLocating}
      onPress={jobs.enableDistance}
      className="min-h-9 flex-row items-center gap-1.5 self-start px-5"
    >
      <Feather name="navigation" size={12} color={COLORS.accentDark} />
      <Text className="text-xs font-semibold text-accent-dark">
        {jobs.isLocating ? t("Đang lấy vị trí…") : t("Bật vị trí để xem khoảng cách")}
      </Text>
    </PressableScale>
  ) : null;

  return (
    <View className="flex-1 bg-canvas">
      <JobsHeader
        tab={jobs.tab}
        onSwitchTab={jobs.switchTab}
        dayChips={jobs.dayChips}
        day={jobs.day}
        onSelectDay={jobs.setDay}
        myTab={jobs.myTab}
        onSelectMyTab={jobs.setMyTab}
        myCounts={jobs.myCounts}
      />

      {jobs.tab === "available" ? (
        <>
          {!!restriction && (
            <PressableScale
              accessibilityRole="button"
              className="mx-5 mt-4 rounded-2xl bg-warning-light p-3"
              onPress={() => router.push({ pathname: "/complaints", params: { tab: "discipline" } })}
            >
              <Text className="text-warning-dark text-sm font-bold">{restriction}</Text>
              <Text className="mt-1 text-warning-dark text-xs">{t("Điểm & xử lý")}</Text>
            </PressableScale>
          )}
          <SortBar value={jobs.sort} onChange={jobs.selectSort} />
          {distanceAction}
          <AvailableJobsList
            state={jobs.available}
            location={jobs.location}
            dayFiltered={jobs.dayFiltered}
            onClearDay={() => jobs.setDay(null)}
            onOpen={jobs.openJob}
            onScrollStart={jobs.markScrolled}
            onEndReached={jobs.onEndReached}
          />
        </>
      ) : (
        <>
          {distanceAction}
          <MyJobsList
            state={jobs.mine}
            tab={jobs.myTab}
            location={jobs.location}
            onOpen={jobs.openJob}
            onScrollStart={jobs.markScrolled}
            onEndReached={jobs.onEndReached}
          />
        </>
      )}
    </View>
  );
}

export default function JobsScreen() {
  return (
    <ActiveProfileGate>
      <JobsContent />
    </ActiveProfileGate>
  );
}
