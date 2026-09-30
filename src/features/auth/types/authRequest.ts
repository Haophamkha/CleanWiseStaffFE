export type LoginRequest = {
  phone?: string;
  username?: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyResetOtpRequest = {
  email: string;
  code: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
};

export type RegisterWorkerRequest = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birth_date: string; // YYYY-MM-DD
  phone_number: string;
};
