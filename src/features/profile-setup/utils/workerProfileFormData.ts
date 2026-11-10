import type {
    PickedFile,
    UpdateWorkerProfileRequest,
} from "@/features/profile-setup/types/WorkerProfile";
import { Platform } from "react-native";

const isPickedFile = (v: unknown): v is PickedFile =>
  !!v && typeof v === "object" && "uri" in (v as any);

export const buildWorkerProfileFormData = async (
  fields: UpdateWorkerProfileRequest,
): Promise<FormData> => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;

    if (isPickedFile(value)) {
      if (Platform.OS === "web") {
        const file = value.file ?? await (await fetch(value.uri)).blob();
        formData.append(key, file, value.name);
      } else {
        formData.append(key, { uri: value.uri, name: value.name, type: value.type } as any);
      }
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
};
