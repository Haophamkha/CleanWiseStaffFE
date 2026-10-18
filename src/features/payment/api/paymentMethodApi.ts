import type {
  BankCatalogItem,
  CreateBankPaymentMethodPayload,
  PaymentMethod,
  PaymentMethodOption,
} from "@/features/payment/types/PaymentMethod";
import { baseApi } from "@/store/baseApi";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const paymentMethodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({ url: "/api/worker/payment-methods/", method: "GET" }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["PaymentMethods"],
    }),
    getPaymentMethodOptions: builder.query<PaymentMethodOption[], void>({
      query: () => ({
        url: "/api/worker/payment-methods/options/",
        method: "GET",
      }),
      transformResponse: (response: any) => unwrap(response) ?? [],
    }),
    getBankCatalog: builder.query<BankCatalogItem[], void>({
      query: () => ({
        url: "/api/worker/payment-methods/banks/",
        method: "GET",
      }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["BankCatalog"],
    }),
    createBankPaymentMethod: builder.mutation<
      PaymentMethod,
      CreateBankPaymentMethodPayload
    >({
      query: (payload) => ({
        url: "/api/worker/payment-methods/",
        method: "POST",
        data: payload,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["PaymentMethods"],
    }),
    startBankAccountVerification: builder.mutation<
      { status: "PENDING" | "SANDBOX_VERIFIED"; requires_otp: boolean; verification_id: number; expires_at?: string; otp_method?: string },
      { id: number; identity?: string; mobile?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/worker/payment-methods/${id}/verification/`,
        method: "POST",
        data,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["PaymentMethods"],
    }),
    confirmBankAccountVerification: builder.mutation<{ status: "SANDBOX_VERIFIED" }, { id: number; otp: string }>({
      query: ({ id, otp }) => ({
        url: `/api/worker/payment-methods/${id}/verification/confirm/`,
        method: "POST",
        data: { otp },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["PaymentMethods"],
    }),
    setDefaultPaymentMethod: builder.mutation<PaymentMethod, number>({
      query: (id) => ({
        url: `/api/worker/payment-methods/${id}/default/`,
        method: "PATCH",
      }),
      transformResponse: unwrap,
      invalidatesTags: ["PaymentMethods"],
    }),
    deletePaymentMethod: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/worker/payment-methods/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentMethodsQuery,
  useGetPaymentMethodOptionsQuery,
  useGetBankCatalogQuery,
  useCreateBankPaymentMethodMutation,
  useStartBankAccountVerificationMutation,
  useConfirmBankAccountVerificationMutation,
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} = paymentMethodApi;
