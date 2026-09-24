import { baseApi } from "@/store/baseApi";

export type EarningPeriod = "week" | "month";
// ONLINE = mọi hình thức trả trước qua app (chuyển khoản, MoMo, VNPay, thẻ)
export type EarningPaymentMethod = "CASH" | "ONLINE";

export type EarningsSummary = {
  /** Số dư ví: tiền đơn chuyển khoản app đang giữ cho nhân viên */
  wallet_balance: string;
  /** Tổng hoa hồng đơn tiền mặt nhân viên chưa nộp lại app (mọi kỳ) */
  commission_owed: string;
  period: {
    type: EarningPeriod;
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    completed_jobs: number;
    /** Tổng giá trị các đơn đã hoàn thành */
    gross_amount: string;
    /** Thu nhập của nhân viên sau khi trừ hoa hồng */
    income: string;
    /** Đơn chuyển khoản: phần app phải chuyển cho nhân viên */
    bank_earned: string;
    /** Đơn tiền mặt: hoa hồng nhân viên phải nộp lại app */
    cash_commission: string;
    /** bank_earned - cash_commission (>0: app chuyển NV, <0: NV chuyển app) */
    net_settlement: string;
  };
  /** Thu nhập theo ngày (tuần) hoặc theo tuần (tháng) */
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
  }),
  overrideExisting: true,
});

export const { useGetEarningsSummaryQuery, useGetEarningsHistoryQuery } =
  earningsApi;
