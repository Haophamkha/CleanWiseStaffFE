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
    online_earned: string;
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
  wallet_credited_at: string | null;
};

export type WithdrawStatus = "PROCESSING" | "SUCCESS" | "FAILED";

export type WithdrawRecord = {
  id: number;
  amount: string;
  status: WithdrawStatus;
  status_display: string;
  bank_name: string;
  account_holder_name: string;
  account_number_masked: string;
  failure_reason: string;
  wallet_transaction_id: number | null;
  created_at: string;
  completed_at: string | null;
};

export type WalletTopup = {
  id: number;
  amount: string;
  status: string; // PENDING | SUCCESS | EXPIRED | ...
  status_display: string;
  checkout_url: string | null;
  qr_code: string | null;
  payment_link_id: string | null;
  link_expires_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type WalletTransaction = {
  id: number;
  type: "PAYMENT" | "REFUND" | "WITHDRAW" | "TOPUP" | "ADJUSTMENT" | "EARNING";
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

const MONEY_TIMEOUT_MS = 30000; // gọi payOS có thể chậm hơn 10s mặc định

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

    requestWithdraw: builder.mutation<
      WithdrawRecord,
      {
        amount: number;
        paymentMethodId?: number | null;
        idempotencyKey: string;
      }
    >({
      query: ({ amount, paymentMethodId, idempotencyKey }) => ({
        url: "/api/worker/wallet/withdraw/",
        method: "POST",
        data: {
          amount,
          ...(paymentMethodId ? { payment_method_id: paymentMethodId } : {}),
        },
        headers: { "Idempotency-Key": idempotencyKey },
        timeout: MONEY_TIMEOUT_MS,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Wallet"],
    }),

    getWithdraw: builder.query<WithdrawRecord, number>({
      query: (id) => ({
        url: `/api/worker/wallet/withdraw/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrapResponse,
    }),

    createTopup: builder.mutation<
      WalletTopup,
      { amount: number; idempotencyKey: string }
    >({
      query: ({ amount, idempotencyKey }) => ({
        url: "/api/worker/wallet/topup/",
        method: "POST",
        data: { amount },
        headers: { "Idempotency-Key": idempotencyKey },
        timeout: MONEY_TIMEOUT_MS,
      }),
      transformResponse: unwrapResponse,
    }),

    getTopup: builder.query<WalletTopup, number>({
      query: (id) => ({
        url: `/api/worker/wallet/topup/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrapResponse,
    }),

    // Chỉ dùng khi dev (BE mock). Production route này không tồn tại.
    mockConfirmTopup: builder.mutation<WalletTopup, number>({
      query: (id) => ({
        url: `/api/worker/wallet/topup/${id}/mock-confirm/`,
        method: "POST",
      }),
      transformResponse: unwrapResponse,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetEarningsSummaryQuery,
  useGetEarningsHistoryQuery,
  useGetWalletTransactionsQuery,
  useRequestWithdrawMutation,
  useGetWithdrawQuery,
  useCreateTopupMutation,
  useGetTopupQuery,
  useMockConfirmTopupMutation,
} = earningsApi;
