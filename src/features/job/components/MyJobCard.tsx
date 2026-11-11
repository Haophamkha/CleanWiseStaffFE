import { memo } from "react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { JobListCard } from "@/features/job/components/JobListCard";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerMySchedule } from "@/features/schedule/types/Schedule";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";

export const MyJobCard = memo(function MyJobCard({
  item,
  location,
  onOpen,
  index = 0,
}: {
  item: WorkerMySchedule;
  location: GeoPoint | null;
  onOpen: OpenJob;
  index?: number;
}) {
  return (
    <JobListCard
      item={item}
      location={location}
      index={index}
      onPress={() => onOpen(item.id, "mine", item.booking_id)}
      badges={<StatusBadge status={item.status} />}
    />
  );
});
