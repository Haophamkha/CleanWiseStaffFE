import type {
  PickedFile,
  UpdateWorkerProfileRequest,
} from "@/types/WorkerProfile";

const isPickedFile = (v: unknown): v is PickedFile =>
  !!v && typeof v === "object" && "uri" in (v as any);

export const buildWorkerProfileFormData = (
  fields: UpdateWorkerProfileRequest,
): FormData => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (isPickedFile(value)) {
      formData.append(key, {
        uri: value.uri,
        name: value.name,
        type: value.type,
      } as any);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};
