import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { JobListCard } from "@/features/job/components/JobListCard";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import { getHighlightedSession } from "@/features/schedule/utils/myScheduleGrouping";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";

export const MyPackageCard = memo(function MyPackageCard({
  bookingId,
  sessions,
  location,
  onOpen,
  index = 0,
}: {
  bookingId: number;
  sessions: WorkerMySchedule[];
  location: GeoPoint | null;
  onOpen: OpenJob;
  index?: number;
}) {
  const { t: tr } = useTranslation();
  const first = sessions[0];
  const total = first.total_sessions ?? sessions.length;
  const completed = first.completed_sessions ?? sessions.filter((s) => s.status === "COMPLETED").length;
  const accepted = first.accepted_sessions ?? sessions.length;
  const highlight = getHighlightedSession(sessions);
  const status = highlight.status === "IN_PROGRESS" || highlight.status === "PENDING"
    ? highlight.status
    : sessions.some((s) => s.status === "COMPLETED") ? "COMPLETED" : first.status;

  return (
    <JobListCard
      item={highlight}
      location={location}
      index={index}
      onPress={() => onOpen(highlight.id, "mine", bookingId)}
      perSession
      badges={
        <>
          <StatusBadge status={status} />
          <Text className="shrink text-xs text-ink-soft">
            {tr("Hoàn thành")} {completed}/{total} · {tr("Đã nhận")} {accepted}/{total}
          </Text>
        </>
      }
    />
  );
});
