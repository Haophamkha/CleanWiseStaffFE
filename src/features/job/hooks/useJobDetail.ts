import { useJobActions } from "@/features/job/hooks/useJobActions";
import { useJobDetailData } from "@/features/job/hooks/useJobDetailData";
import type { PaymentStatus } from "@/features/schedule/types/Schedule";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, type ComponentProps } from "react";
import { Alert, Linking } from "react-native";

const HIDE_TAKEN_SESSIONS = true;

export type InfoRowData = {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
};

export type JobSummary = {
  codeLine: string;
  status: string;
  countBadge: string | null;
  service: string;
  priceCaption: string;
  priceLabel: string;
  payment: PaymentStatus;
  rows: InfoRowData[];
  noteRows: InfoRowData[];
  hasCoordinates: boolean;
};

export type JobActionsState = ReturnType<typeof useJobActions>;

export function useJobDetail() {
  const {
    id,
    source,
    bookingId: bookingIdParam,
    view,
  } = useLocalSearchParams<{
    id: string;
    source?: string;
    bookingId?: string;
    view?: string;
  }>();
  const scheduleId = Number(id);
  const isMine = source === "mine";
  const isSingleSessionView = view === "session";
  const paramBookingId = Number(bookingIdParam) || undefined;

  const {
    item,
    mineItem,
    bookingSchedules,
    openSessions,
    isLoading,
    isPackage,
    totalSessions,
    bookingId,
    refetchBookingSchedules,
    refetchMineSchedules,
  } = useJobDetailData({
    scheduleId,
    isMine,
    isSingleSessionView,
    paramBookingId,
  });

  const visibleSessions = HIDE_TAKEN_SESSIONS
    ? bookingSchedules.filter((s) => s.claim_state !== "TAKEN")
    : bookingSchedules;

  const destination = useMemo(() => {
    const lat = Number(item?.address_latitude);
    const lng = Number(item?.address_longitude);
    if (
      !item?.address_latitude ||
      !item?.address_longitude ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return null;
    }
    return { latitude: lat, longitude: lng };
  }, [item?.address_latitude, item?.address_longitude]);

  const actions = useJobActions({
    scheduleId,
    isMine,
    item,
    mineItem,
    bookingId,
    bookingSchedules,
    openSessions,
    refetchBookingSchedules,
    refetchMineSchedules,
  });

  const showImages =
    isMine &&
    !!mineItem &&
    !["PENDING", "CANCELLED", "MISSED"].includes(mineItem.status);
  const canEditImages = mineItem?.status === "IN_PROGRESS";

  const openDirections = () => {
    if (!item?.address_latitude || !item?.address_longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${item.address_latitude},${item.address_longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Không thể mở bản đồ", "Vui lòng thử lại sau."),
    );
  };

  let summary: JobSummary | null = null;
  if (item) {
    const rows: InfoRowData[] = [];
    if (!isPackage) {
      rows.push(
        {
          icon: "calendar",
          label: "Bắt đầu",
          value: formatDateTime(item.scheduled_start),
        },
        {
          icon: "clock",
          label: "Kết thúc",
          value: formatDateTime(item.scheduled_end),
        },
      );
    }
    rows.push({
      icon: "map-pin",
      label: "Khu vực",
      value: `${item.address_ward ? item.address_ward + ", " : ""}${item.address_city}`,
    });
    if (mineItem) {
      rows.push(
        {
          icon: "home",
          label: "Địa chỉ chi tiết",
          value: mineItem.address_line,
        },
        { icon: "user", label: "Người nhận", value: mineItem.receiver_name },
        {
          icon: "phone",
          label: "Số điện thoại",
          value: mineItem.receiver_phone,
        },
      );
    }

    const noteRows: InfoRowData[] = [];
    if (item.booking_note) {
      noteRows.push({
        icon: "file-text",
        label: "Ghi chú đơn",
        value: item.booking_note,
      });
    }
    if (mineItem?.note) {
      noteRows.push({
        icon: "edit-3",
        label: "Ghi chú buổi làm",
        value: mineItem.note,
      });
    }

    summary = {
      codeLine: isPackage
        ? `${item.booking_code} · Gói ${totalSessions} buổi`
        : `${item.booking_code} · Buổi ${item.sequence_no}/${item.total_sessions}`,
      status: item.status,
      countBadge: isPackage
        ? `Còn ${openSessions.length}/${totalSessions} buổi`
        : null,
      service: item.service_name,
      priceCaption: isPackage ? "Thu nhập / buổi" : "Thu nhập",
      priceLabel: formatCurrency(item.price) ?? "—",
      payment: item.payment_status,
      rows,
      noteRows,
      hasCoordinates: !!item.address_latitude && !!item.address_longitude,
    };
  }

  return {
    isLoading,
    item,
    mineItem,
    summary,
    isMine,
    isPackage,
    totalSessions,
    openSessions,
    visibleSessions,
    hasOpenSessions: isPackage && openSessions.length > 0,
    showImages,
    canEditImages,
    actions,
    missingTitle: isMine
      ? "Không tìm thấy buổi làm"
      : "Đơn này không còn buổi trống",
    missingMessage: isMine
      ? undefined
      : "Có thể các buổi đã được nhân viên khác nhận.",
    openDirections,
    destination,
    showRouteMap: destination !== null && !isSingleSessionView,
    goBack: () => router.back(),
  };
}
