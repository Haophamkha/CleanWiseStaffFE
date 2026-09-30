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
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  avatar: string | null;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
};
