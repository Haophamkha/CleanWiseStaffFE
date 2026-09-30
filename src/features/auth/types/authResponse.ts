import type { User } from "./User";

export type UserResponse = Partial<User>;

export type AuthResponse = {
  access: string;
  refresh: string;
  user: UserResponse;
  is_new_user?: boolean;
};

export type RegisterWorkerResponse = AuthResponse & {
  worker_profile: {
    id: number;
    status: "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  };
};

export type MessageResponse = {
  message?: string;
  detail?: string;
};
