export type PaymentMethodType = "BANK_ACCOUNT" | "MOMO" | "VNPAY";
export type PaymentMethodStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED"
  | "DISCONNECTED";

export type PaymentMethod = {
  id: number;
  method_type: PaymentMethodType;
  method_type_display: string;
  usage_type: "PAYOUT";
  display_name: string;
  bank_bin: string;
  bank_code: string;
  bank_name: string;
  account_holder_name: string;
  account_number_masked: string;
  verification_status: PaymentMethodStatus;
  verification_status_display: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type BankCatalogItem = {
  id: number | string | null;
  name: string;
  code: string;
  bin: string;
  short_name: string;
  logo: string;
  transfer_supported: boolean;
  lookup_supported: boolean;
};

export type PaymentMethodOption = {
  code: PaymentMethodType;
  name: string;
  status: "AVAILABLE" | "COMING_SOON";
};

export type CreateBankPaymentMethodPayload = {
  bank_bin: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  display_name?: string;
  is_default?: boolean;
};
