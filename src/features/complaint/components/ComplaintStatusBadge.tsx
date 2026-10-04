import type { ComplaintStatus } from "@/features/complaint/api/complaintApi";
import { Text, View } from "react-native";

const STYLES: Record<ComplaintStatus, { bg: string; text: string }> = {
  PENDING: { bg: "bg-warning-light", text: "text-warning-dark" },
  IN_REVIEW: { bg: "bg-accent-light", text: "text-ink" },
  RESOLVED: { bg: "bg-success-light", text: "text-success" },
  REJECTED: { bg: "bg-danger-light", text: "text-danger" },
  CANCELLED: { bg: "bg-accent-light", text: "text-ink-muted" },
};

export function ComplaintStatusBadge({
  status,
  label,
}: {
  status: ComplaintStatus;
  label: string;
}) {
  const s = STYLES[status] ?? STYLES.CANCELLED;
  return (
    <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
      <Text className={`text-[11px] font-bold ${s.text}`}>{label}</Text>
    </View>
  );
}
