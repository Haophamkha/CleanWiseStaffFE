import { COLORS } from "@/constants/theme";
import {
  useGetEarningsHistoryQuery,
  useGetEarningsSummaryQuery,
  useGetWalletTransactionsQuery,
  type EarningItem,
  type EarningPeriod,
  type WalletTransaction,
} from "@/features/earnings/api/earningsApi";
import {
  formatDayMonth,
  formatEarningDateTime,
  formatVnd,
} from "@/features/earnings/utils/earningsFormat";
import { useState } from "react";

export type PeriodTab = { key: EarningPeriod; label: string };

export type SeriesPoint = { label: string; amount: string };

export type HistoryRowView = {
  id: EarningItem["id"];
  isCash: boolean;
  pending: boolean;
  serviceName: string;
  metaText: string;
  methodText: string;
  amountText: string;
  amountColor: string;
};

export type WalletTxRowView = {
  id: number;
  isCredit: boolean;
  title: string;
  subText: string;
  timeText: string;
  amountText: string;
  amountColor: string;
  statusText: string | null;
};

const PERIOD_TABS: PeriodTab[] = [
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
];

export function useEarnings() {
  const [period, setPeriod] = useState<EarningPeriod>("week");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const summaryQuery = useGetEarningsSummaryQuery(period);
  const historyQuery = useGetEarningsHistoryQuery(period);
  const walletTxQuery = useGetWalletTransactionsQuery();

  const summary = summaryQuery.data;
  const history = historyQuery.data ?? [];
  const p = summary?.period;

  const isRefreshing =
    (summaryQuery.isFetching ||
      historyQuery.isFetching ||
      walletTxQuery.isFetching) &&
    !summaryQuery.isLoading;

  const onRefresh = () => {
    summaryQuery.refetch();
    historyQuery.refetch();
    walletTxQuery.refetch();
  };

  const data =
    summary && p
      ? {
          wallet: {
            balanceText: formatVnd(summary.wallet_balance),
            commissionOwedText: formatVnd(summary.commission_owed),
            pendingReleaseText: formatVnd(summary.pending_release),
            hasPending: Number(summary.pending_release) > 0,
          },
          period: {
            rangeText: `${formatDayMonth(p.start)} - ${formatDayMonth(p.end)}`,
            incomeText: formatVnd(p.income),
            completedJobs: String(p.completed_jobs),
            grossText: formatVnd(p.gross_amount),
            series: summary.series as SeriesPoint[],
          },
          settlement: {
            onlineText: `+${formatVnd(p.online_earned)}`,
            cashText: `-${formatVnd(p.cash_commission)}`,
          },
        }
      : null;

  // Tiền mặt: hoa hồng đã trừ thẳng vào ví (số âm).
  // Online: app giữ tiền, vào ví sau tối đa 24 giờ (wallet_credited_at rỗng = đang chờ).
  const historyRows: HistoryRowView[] = history.map((item) => {
    const isCash = item.payment_method === "CASH";
    const pending = !isCash && !item.wallet_credited_at;
    return {
      id: item.id,
      isCash,
      pending,
      serviceName: item.service_name,
      metaText: `${item.booking_code} · ${formatEarningDateTime(item.completed_at)}`,
      methodText: `${
        isCash ? "Tiền mặt · hoa hồng đã trừ ví" : "Online · app chuyển bạn"
      } · đơn ${formatVnd(item.gross_amount)}`,
      amountText: isCash
        ? `-${formatVnd(item.commission_amount)}`
        : `+${formatVnd(item.worker_amount)}`,
      amountColor: isCash
        ? COLORS.danger
        : pending
          ? COLORS.inkSoft
          : COLORS.success,
    };
  });

  const walletTxRows: WalletTxRowView[] = (walletTxQuery.data ?? []).map(
    (tx: WalletTransaction) => {
      const isCredit = tx.direction === "CREDIT";
      const failed = tx.status === "FAILED";
      return {
        id: tx.id,
        isCredit,
        title: tx.type_display,
        subText: tx.note || tx.booking_code || "",
        timeText: formatEarningDateTime(tx.created_at),
        amountText: `${isCredit ? "+" : "-"}${formatVnd(tx.amount)}`,
        amountColor: failed
          ? COLORS.inkMuted
          : isCredit
            ? COLORS.success
            : COLORS.danger,
        statusText: tx.status !== "SUCCESS" ? tx.status_display : null,
      };
    },
  );

  return {
    period,
    setPeriod,
    periodTabs: PERIOD_TABS,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError || !data,
    isRefreshing,
    onRefresh,
    data,
    historyLoading: historyQuery.isLoading,
    historyRows,
    walletTxLoading: walletTxQuery.isLoading,
    walletTxRows,
    walletBalance: Number(summary?.wallet_balance ?? 0),
    showWithdraw,
    openWithdraw: () => setShowWithdraw(true),
    closeWithdraw: () => setShowWithdraw(false),
    showTopup,
    openTopup: () => setShowTopup(true),
    closeTopup: () => setShowTopup(false),
  };
}

export type EarningsData = NonNullable<ReturnType<typeof useEarnings>["data"]>;
