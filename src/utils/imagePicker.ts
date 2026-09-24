import type { PickedFile } from "@/types/WorkerProfile";
import * as ImagePicker from "expo-image-picker";

export async function pickImage(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    // MediaTypeOptions.Images đã deprecated, thay bằng mảng MediaType
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg";
  const type = asset.mimeType ?? "image/jpeg";

  return { uri: asset.uri, name, type };
}
