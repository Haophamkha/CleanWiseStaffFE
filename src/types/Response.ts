import type { User } from "./User";

export type UserResponse = Partial<User>;

export type AuthResponse = {
  access: string;
  refresh: string;
  user: UserResponse;
  is_new_user?: boolean;
};

export type RegisterWorkerResponse = AuthResponse & {
  profile_status: "DRAFT" | string;
};

export type MessageResponse = {
  message?: string;
  detail?: string;
};
