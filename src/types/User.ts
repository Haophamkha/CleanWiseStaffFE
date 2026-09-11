// src/types/User.ts
export type UserRole = "ADMIN" | "CUSTOMER" | "WORKER";

export type User = {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
};
