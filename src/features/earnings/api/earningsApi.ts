import { baseApi } from "@/store/baseApi";

export type EarningPeriod = "week" | "month";
// ONLINE = mọi hình thức trả trước qua app (chuyển khoản, MoMo, VNPay, thẻ)
export type EarningPaymentMethod = "CASH" | "ONLINE";

export type EarningsSummary = {
  wallet_balance: string;
  commission_owed: string;
  /** Online đang giữ, chưa vào ví (tối đa 24 giờ) */
  pending_release: string;
  period: {
    type: EarningPeriod;
    start: string;
    end: string;
    completed_jobs: number;
    gross_amount: string;
    income: string;
    /** Đơn online: phần nhân viên nhận (vào ví sau thời gian giữ) */
    online_earned: string;
    /** Đơn tiền mặt: hoa hồng đã giữ chỗ / trừ ví */
    cash_commission: string;
  };
  series: { label: string; amount: string }[];
};

export type EarningItem = {
  id: number;
  booking_code: string;
  service_name: string;
  completed_at: string;
  payment_method: EarningPaymentMethod;
  gross_amount: string;
  commission_amount: string;
  worker_amount: string;
  /** null = đang chờ giải ngân (chỉ có ý nghĩa với ONLINE) */
  wallet_credited_at: string | null;
};

export type WalletWithdrawResult = {
  id: number;
  type: string;
  type_display: string;
  amount: string;
  balance_after: string;
  status: string;
  status_display: string;
  booking_code: string | null;
  note: string | null;
  created_at: string;
};

export type WalletTransaction = {
  id: number;
  type: "PAYMENT" | "REFUND" | "WITHDRAW" | "ADJUSTMENT" | "EARNING";
  type_display: string;
  amount: string;
  balance_after: string;
  status: string;
  status_display: string;
  booking_code: string | null;
  note: string | null;
  created_at: string;
  direction: "CREDIT" | "DEBIT";
};

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const earningsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEarningsSummary: builder.query<EarningsSummary, EarningPeriod>({
      query: (period) => ({
        url: "/api/worker/earnings/summary/",
        method: "GET",
        params: { period },
      }),
      transformResponse: unwrapResponse,
      providesTags: ["Wallet"],
    }),

    getEarningsHistory: builder.query<EarningItem[], EarningPeriod>({
      query: (period) => ({
        url: "/api/worker/earnings/history/",
        method: "GET",
        params: { period },
      }),
      transformResponse: unwrapResponse,
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<WalletTransaction[], void>({
      query: () => ({
        url: "/api/worker/wallet/transactions/",
        method: "GET",
        params: { page_size: 10 },
      }),
      transformResponse: (r: any) => unwrapResponse(r)?.results ?? [],
      providesTags: ["Wallet"],
    }),

    withdrawWallet: builder.mutation<
      WalletWithdrawResult,
      { amount: number; idempotencyKey: string }
    >({
      query: ({ amount, idempotencyKey }) => ({
        url: "/api/worker/wallet/withdraw/",
        method: "POST",
        data: { amount },
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Wallet"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetEarningsSummaryQuery,
  useGetEarningsHistoryQuery,
  useGetWalletTransactionsQuery,
  useWithdrawWalletMutation,
} = earningsApi;
