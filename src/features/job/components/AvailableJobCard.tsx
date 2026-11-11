import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { JobListCard } from "@/features/job/components/JobListCard";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";

export const AvailableJobCard = memo(function AvailableJobCard({
  item,
  location,
  onOpen,
  index = 0,
}: {
  item: WorkerSchedule;
  location: GeoPoint | null;
  onOpen: OpenJob;
  index?: number;
}) {
  const { t: tr } = useTranslation();
  const total = item.total_sessions ?? 1;
  const isPackage = total > 1;
  const invitation = item.invitation?.status === "PENDING" ? item.invitation : null;
  const expiresAt = invitation?.expires_at ?? (item.is_preferred_for_me ? item.preferred_until : null);
  const minutes = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000) : 0;
  const invitationLabel = minutes > 0
    ? `${invitation ? tr("Lời mời từ admin") : tr("Khách hàng mời bạn")} ${tr("· còn")} ${minutes} ${tr("phút")}`
    : undefined;

  return (
    <JobListCard
      item={item}
      location={location}
      index={index}
      onPress={() => onOpen(item.id, "available", item.booking_id)}
      available
      perSession={isPackage}
      invitation={invitationLabel}
      badges={isPackage ? (
        <Text className="rounded-full bg-warning-light px-2 py-0.5 text-xs font-semibold text-warning-dark">
          {tr("Còn {{value0}}/{{value1}} buổi", { value0: item.available_sessions ?? 1, value1: total })}
        </Text>
      ) : undefined}
    />
  );
});
