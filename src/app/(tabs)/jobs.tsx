import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { AvailableJobsList } from "@/features/job/components/AvailableJobsList";
import { JobsHeader } from "@/features/job/components/JobsHeader";
import { MyJobsList } from "@/features/job/components/MyJobsList";
import { useJobs } from "@/features/job/hooks/useJobs";
import { View } from "react-native";

function JobsContent() {
  const jobs = useJobs();

  return (
    <View className="flex-1 bg-canvas">
      <JobsHeader
        tab={jobs.tab}
        onSwitchTab={jobs.switchTab}
        dayChips={jobs.dayChips}
        day={jobs.day}
        onSelectDay={jobs.setDay}
      />

      {jobs.tab === "available" ? (
        <AvailableJobsList
          state={jobs.available}
          dayFiltered={jobs.dayFiltered}
          onClearDay={() => jobs.setDay(null)}
          onOpen={jobs.openJob}
          onScrollStart={jobs.markScrolled}
          onEndReached={jobs.onEndReached}
        />
      ) : (
        <MyJobsList
          state={jobs.mine}
          onOpen={jobs.openJob}
          onScrollStart={jobs.markScrolled}
          onEndReached={jobs.onEndReached}
        />
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
