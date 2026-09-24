import type { PickedFile } from "@/types/WorkerProfile";
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
      // NativeWind "aspect-square" — class utility này từng khiến ô ảnh
      // co về kích thước tối thiểu (chỉ còn cái badge tròn nổi ra ngoài)
      // trong một số trường hợp re-render, không rõ do version NativeWind
      // hay timing layout. Set trực tiếp qua style đảm bảo Yoga luôn có
      // đủ thông tin để tính kích thước ô vuông, không phụ thuộc NativeWind
      // resolve class kịp lúc hay không.
      style={[
        { opacity: disabled ? 0.5 : 1 },
        isCircle ? { width: 160, height: 160 } : { aspectRatio: 1 },
      ]}
      className={`items-center justify-center border-2 border-dashed overflow-hidden ${
        disabled
          ? "border-[#9CA3AF] bg-[#F3F4F6]"
          : "border-[#2563EB] bg-[#EEF2FF]"
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
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full items-center justify-center"
            style={{
              backgroundColor: disabled
                ? "rgba(107,114,128,0.9)"
                : "rgba(37,99,235,0.9)",
            }}
          >
            <Feather
              name={disabled ? "lock" : "edit-2"}
              size={13}
              color="#fff"
            />
          </View>
        </>
      ) : (
        <View className="items-center">
          <Feather
            name="camera"
            size={26}
            color={disabled ? "#9CA3AF" : "#2563EB"}
          />
          <Text
            className={`font-semibold text-sm mt-2 ${
              disabled ? "text-[#9CA3AF]" : "text-[#2563EB]"
            }`}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
