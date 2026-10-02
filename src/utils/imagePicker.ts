import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

const toPickedFile = (asset: ImagePicker.ImagePickerAsset): PickedFile => ({
  uri: asset.uri,
  name: asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg",
  type: asset.mimeType ?? "image/jpeg",
});

export async function pickImage(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    // MediaTypeOptions.Images đã deprecated, thay bằng mảng MediaType
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return toPickedFile(result.assets[0]);
}

type TakePhotoOptions = {
  /** true = camera trước (selfie), mặc định camera sau */
  front?: boolean;
  /** true = cho cắt vuông sau khi chụp (ảnh chân dung) */
  square?: boolean;
};

export async function takePhoto(
  options: TakePhotoOptions = {},
): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Cần quyền camera",
      "Hãy cho phép ứng dụng dùng camera trong Cài đặt để chụp ảnh.",
      [
        { text: "Để sau", style: "cancel" },
        { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
      ],
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    cameraType: options.front
      ? ImagePicker.CameraType.front
      : ImagePicker.CameraType.back,
    allowsEditing: !!options.square,
    aspect: options.square ? [1, 1] : undefined,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return toPickedFile(result.assets[0]);
}
