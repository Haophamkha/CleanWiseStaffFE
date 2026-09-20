// src/types/User.ts
export type UserRole = "ADMIN" | "CUSTOMER" | "WORKER";

export type ProfileStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED";

export type User = {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  profile_status?: ProfileStatus; // TODO: xác nhận tên field thật từ BE
};
