import { baseApi } from "@/store/baseApi";
import type {
  BankCatalogItem,
  CreateBankPaymentMethodPayload,
  PaymentMethod,
  PaymentMethodOption,
} from "@/types/PaymentMethod";

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
      query: () => ({ url: "/api/worker/payment-methods/options/", method: "GET" }),
      transformResponse: (response: any) => unwrap(response) ?? [],
    }),
    getBankCatalog: builder.query<BankCatalogItem[], void>({
      query: () => ({ url: "/api/worker/payment-methods/banks/", method: "GET" }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["BankCatalog"],
    }),
    createBankPaymentMethod: builder.mutation<PaymentMethod, CreateBankPaymentMethodPayload>({
      query: (payload) => ({
        url: "/api/worker/payment-methods/",
        method: "POST",
        data: payload,
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
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} = paymentMethodApi;
