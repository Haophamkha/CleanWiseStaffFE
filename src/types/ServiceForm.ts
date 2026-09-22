export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  image?: string;
}

export interface ConditionalOptionGroup {
  when: Record<string, string>;
  items: FieldOption[];
}

export type FormFieldType =
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "WEEKDAY_MULTI_SELECT"
  | "QUANTITY"
  | "TEXT"
  | "TEXTAREA"
  | "BOOLEAN"
  | "DATE"
  | "TIME"
  | "REPEATABLE_GROUP"
  | "TASK_CHECKLIST";

export interface FormField {
  key: string;
  type: FormFieldType;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  min_days_from_now?: number;
  options?: FieldOption[] | ConditionalOptionGroup[];
  options_by?: string;
  item_fields?: FormField[];
}
