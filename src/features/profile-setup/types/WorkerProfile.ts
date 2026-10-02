export type Gender = "MALE" | "FEMALE" | "OTHER";

export type ProfileStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED";

export type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

export type RegisteredService = {
  id: number;
  code: string;
  section_code: string;
  name: string;
};

export type ApprovedBy = {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date: string;
  avatar: string;
  role: string;
  is_active: boolean;
  date_joined: string;
};

export type RejectedFields = Record<string, string>;

export type WorkerProfileResponse = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: Gender;
  birth_date: string;
  role: string;
  status: ProfileStatus;
  bio: string;
  experience_years: number;
  identity_number: string;
  registered_service: RegisteredService | null;
  portrait: string | null;
  identity_front: string | null;
  identity_back: string | null;
  certificate_file: string | null;
  approved_by: ApprovedBy | null;
  approved_at: string | null;
  rejection_reason: string | null;
  rejected_fields: RejectedFields;
  average_rating: string;
  total_completed_jobs: number;
  is_complete: boolean;
  missing_fields: string[];
  completion_percent: number;
  created_at: string;
  updated_at: string;
};

export type UpdateWorkerProfileRequest = Partial<{
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: Gender;
  birth_date: string; // YYYY-MM-DD
  bio: string;
  experience_years: number;
  service_id: number | null;
  identity_number: string;
  portrait: PickedFile;
  identity_front: PickedFile;
  identity_back: PickedFile;
  certificate_file: PickedFile;
}>;
