import { COLORS } from "@/constants/theme";
import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { pickImage } from "@/utils/imagePicker";
import { Feather } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value: PickedFile | null;
  onChange: (file: PickedFile) => void;
  shape?: "circle" | "square";
  /** URL ảnh đã upload trước đó (từ server). Chỉ hiển thị khi chưa chọn ảnh mới. */
  existingUri?: string | null;
  /** Khóa: vẫn hiện ảnh nhưng làm mờ và không cho chọn ảnh khác. */
  disabled?: boolean;
};

export function ImageUploadBox({
  label,
  value,
  onChange,
  shape = "square",
  existingUri,
  disabled = false,
}: Props) {
  const handlePick = async () => {
    if (disabled) return;
    const file = await pickImage();
    if (file) onChange(file);
  };

  const isCircle = shape === "circle";
  const previewUri = value?.uri ?? existingUri ?? null;

  return (
    <TouchableOpacity
      onPress={handlePick}
      disabled={disabled}
      activeOpacity={0.7}
      // aspectRatio đặt qua style (Yoga xử lý trực tiếp) thay vì class
      // NativeWind "aspect-square": class này từng khiến ô ảnh co về kích
      // thước tối thiểu trong một số trường hợp re-render.
      style={[
        { opacity: disabled ? 0.5 : 1 },
        isCircle ? { width: 160, height: 160 } : { aspectRatio: 1 },
      ]}
      className={`items-center justify-center border-2 border-dashed overflow-hidden ${
        disabled
          ? "border-ink-muted bg-accent-light"
          : "border-accent bg-canvas"
      } ${isCircle ? "rounded-full self-center" : "flex-1 rounded-2xl"}`}
    >
      {previewUri ? (
        <>
          <Image
            source={{ uri: previewUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View
            className={`absolute bottom-2 right-2 w-7 h-7 rounded-full items-center justify-center ${
              disabled ? "bg-ink-muted" : "bg-ink/90"
            }`}
          >
            <Feather
              name={disabled ? "lock" : "edit-2"}
              size={13}
              color={COLORS.white}
            />
          </View>
        </>
      ) : (
        <View className="items-center">
          <Feather
            name="camera"
            size={26}
            color={disabled ? COLORS.inkMuted : COLORS.accentDark}
          />
          <Text
            className={`font-semibold text-sm mt-2 ${
              disabled ? "text-ink-muted" : "text-accent-dark"
            }`}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
