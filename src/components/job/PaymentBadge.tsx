import { Text, View } from "react-native";

import type { PaymentStatus } from "@/types/Schedule";
import { PAYMENT_STATUS_MAP } from "@/utils/scheduleStatus";

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const info = PAYMENT_STATUS_MAP[status];
  if (!info) return null;
  return (
    <View
      className="self-start px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: info.bg }}
    >
      <Text className="text-xs font-bold" style={{ color: info.text }}>
        {info.label}
      </Text>
    </View>
  );
}
