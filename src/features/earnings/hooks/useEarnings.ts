import { COLORS } from "@/constants/theme";
import {
    useGetEarningsHistoryQuery,
    useGetEarningsSummaryQuery,
    type EarningItem,
    type EarningPeriod,
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
  serviceName: string;
  metaText: string;
  methodText: string;
  amountText: string;
  amountColor: string;
};

const PERIOD_TABS: PeriodTab[] = [
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
];

export function useEarnings() {
  const [period, setPeriod] = useState<EarningPeriod>("week");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const summaryQuery = useGetEarningsSummaryQuery(period);
  const historyQuery = useGetEarningsHistoryQuery(period);

  const summary = summaryQuery.data;
  const history = historyQuery.data ?? [];
  const p = summary?.period;

  const isRefreshing =
    (summaryQuery.isFetching || historyQuery.isFetching) &&
    !summaryQuery.isLoading;

  const onRefresh = () => {
    summaryQuery.refetch();
    historyQuery.refetch();
  };

  const net = Number(p?.net_settlement ?? 0);
  const settlementText =
    net > 0
      ? `App đã chuyển vào ví ${formatVnd(net)}`
      : net < 0
        ? `Hệ thống đã tự trừ ví ${formatVnd(Math.abs(net))}`
        : "Không phát sinh chênh lệch";
  const settlementColor =
    net > 0 ? COLORS.success : net < 0 ? COLORS.danger : COLORS.inkSoft;

  const data =
    summary && p
      ? {
          wallet: {
            balanceText: formatVnd(summary.wallet_balance),
            commissionOwedText: formatVnd(summary.commission_owed),
          },
          period: {
            rangeText: `${formatDayMonth(p.start)} - ${formatDayMonth(p.end)}`,
            incomeText: formatVnd(p.income),
            completedJobs: String(p.completed_jobs),
            grossText: formatVnd(p.gross_amount),
            series: summary.series as SeriesPoint[],
          },
          settlement: {
            bankText: `+${formatVnd(p.bank_earned)}`,
            cashText: `-${formatVnd(p.cash_commission)}`,
            resultText: settlementText,
            resultColor: settlementColor,
          },
        }
      : null;

  // Tiền mặt: nhân viên đã cầm tiền, hoa hồng đã được trừ thẳng vào ví (số âm).
  // Chuyển khoản: app giữ tiền, đã chuyển phần của nhân viên vào ví (số dương).
  const historyRows: HistoryRowView[] = history.map((item) => {
    const isCash = item.payment_method === "CASH";
    return {
      id: item.id,
      isCash,
      serviceName: item.service_name,
      metaText: `${item.booking_code} · ${formatEarningDateTime(item.completed_at)}`,
      methodText: `${
        isCash
          ? "Tiền mặt · hoa hồng đã trừ ví"
          : "Chuyển khoản · app chuyển bạn"
      } · đơn ${formatVnd(item.gross_amount)}`,
      amountText: isCash
        ? `-${formatVnd(item.commission_amount)}`
        : `+${formatVnd(item.worker_amount)}`,
      amountColor: isCash ? COLORS.danger : COLORS.success,
    };
  });

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
    walletBalance: Number(summary?.wallet_balance ?? 0),
    showWithdraw,
    openWithdraw: () => setShowWithdraw(true),
    closeWithdraw: () => setShowWithdraw(false),
  };
}

export type EarningsData = NonNullable<ReturnType<typeof useEarnings>["data"]>;
