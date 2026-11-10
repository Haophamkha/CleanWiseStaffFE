import { localizeTransactionNote } from "@/features/earnings/utils/localizeTransactionNote";
import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";

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
  code: string | null;
  isCredit: boolean;
  title: string;
  subText: string;
  bookingCode: string | null;
  timeText: string;
  amountText: string;
  amountColor: string;
  statusText: string | null;
};

function getLocalizedPeriodTabs(translateText = defaultTranslate): PeriodTab[] {
  return [
    { key: "week", label: translateText("Tuần này") },
    { key: "month", label: translateText("Tháng này") },
  ];
}

export function useEarnings() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

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
            balanceText: formatVnd(summary.wallet_balance, tr),
            commissionOwedText: formatVnd(summary.commission_owed, tr),
          },
          period: {
            rangeText: `${formatDayMonth(p.start)} - ${formatDayMonth(p.end)}`,
            incomeText: formatVnd(p.income, tr),
            completedJobs: String(p.completed_jobs),
            grossText: formatVnd(p.gross_amount, tr),
            series: (summary.series as SeriesPoint[]).map(point => ({ ...point, label: tr(point.label) })),
          },
          settlement: {
            onlineText: `+${formatVnd(p.online_earned, tr)}`,
            cashText: `-${formatVnd(p.cash_commission, tr)}`,
          },
        }
      : null;

  // Tiền mặt: hoa hồng đã trừ thẳng vào ví (số âm).
  // Online đã thanh toán được ghi có ngay khi hoàn thành buổi.
  const historyRows: HistoryRowView[] = history.map((item) => {
    const isCash = item.payment_method === "CASH";
    const pending = !isCash && !item.wallet_credited_at;
    return {
      id: item.id,
      isCash,
      pending,
      serviceName: tr(item.service_name),
      metaText: `${item.booking_code} · ${formatEarningDateTime(item.completed_at)}`,
      methodText: tr("{{value0}} · đơn {{value1}}", { value0: isCash ? tr("Tiền mặt · hoa hồng đã trừ ví") : tr("Online · app chuyển bạn"), value1: formatVnd(item.gross_amount, tr) }),
      amountText: isCash
        ? `-${formatVnd(item.commission_amount, tr)}`
        : `+${formatVnd(item.worker_amount, tr)}`,
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
        code: tx.code ?? null,
        isCredit,
        title: tr(tx.type_display),
        subText: tx.note ? localizeTransactionNote(tx.note, tr) : "",
        bookingCode: tx.booking_code ?? null,
        timeText: formatEarningDateTime(tx.created_at),
        amountText: `${isCredit ? "+" : "-"}${formatVnd(tx.amount, tr)}`,
        amountColor: failed
          ? COLORS.inkMuted
          : isCredit
            ? COLORS.success
            : COLORS.danger,
        statusText: tx.status !== "SUCCESS" ? tr(tx.status_display) : null,
      };
    },
  );

  return {
    period,
    setPeriod,
    periodTabs: getLocalizedPeriodTabs(tr),
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
