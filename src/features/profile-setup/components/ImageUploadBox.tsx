import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { pickImage, takePhoto } from "@/utils/imagePicker";
import { Feather } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherName = ComponentProps<typeof Feather>["name"];
type Source = "camera" | "library";

/** square: ô vuông (flex-1) | card: tỉ lệ CCCD, full ngang | wide: 4:3 full ngang */
type Shape = "circle" | "square" | "card" | "wide";

type Props = {
  label: string;
  value: PickedFile | null;
  onChange: (file: PickedFile) => void;
  shape?: Shape;
  /** URL ảnh đã upload trước đó (từ server). Chỉ hiển thị khi chưa chọn ảnh mới. */
  existingUri?: string | null;
  /** Khóa: vẫn hiện ảnh nhưng làm mờ và không cho chọn ảnh khác. */
  disabled?: boolean;
  /** Camera trước (selfie). Mặc định camera sau. */
  frontCamera?: boolean;
  /** Tiêu đề bottom sheet. Mặc định dùng label. */
  sheetTitle?: string;
};

const RATIO: Partial<Record<Shape, number>> = {
  square: 1,
  card: 1.586,
  wide: 4 / 3,
};

function useImageSource(
  onChange: (file: PickedFile) => void,
  disabled: boolean,
  frontCamera: boolean,
  square: boolean,
) {
  const [open, setOpen] = useState(false);

  const openSheet = () => {
    if (!disabled) setOpen(true);
  };
  const closeSheet = () => setOpen(false);

  const choose = async (source: Source) => {
    setOpen(false);
    // Chờ modal đóng hẳn rồi mới mở camera/thư viện (iOS không mở được cùng lúc)
    await new Promise((resolve) => setTimeout(resolve, 350));
    const file =
      source === "camera"
        ? await takePhoto({ front: frontCamera, square })
        : await pickImage();
    if (file) onChange(file);
  };

  return { open, openSheet, closeSheet, choose };
}

function SourceOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: FeatherName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      className="flex-row items-center bg-canvas border border-line rounded-2xl px-4 mb-3"
      style={{ minHeight: 64 }}
    >
      <View className="w-11 h-11 rounded-full bg-accent-light items-center justify-center">
        <Feather name={icon} size={20} color={COLORS.ink} />
      </View>
      <View className="flex-1 ml-3.5">
        <Text className="text-ink text-[15px] font-extrabold">{title}</Text>
        <Text className="text-ink-muted text-xs mt-0.5">{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
    </TouchableOpacity>
  );
}

function SourceSheet({
  visible,
  title,
  onClose,
  onChoose,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onChoose: (source: Source) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: OVERLAY }}
        onPress={onClose}
      >
        <Pressable
          className="bg-surface px-5 pt-3"
          style={{
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            paddingBottom: Math.max(insets.bottom, 16) + 4,
          }}
          onPress={() => {}}
        >
          <View className="w-10 h-1 rounded-full bg-line self-center mb-4" />
          <Text className="text-ink text-lg font-extrabold">{title}</Text>
          <Text className="text-ink-soft text-sm mt-1 mb-4">
            Chọn cách thêm ảnh
          </Text>

          <SourceOption
            icon="camera"
            title="Chụp ảnh"
            subtitle="Mở camera để chụp ngay"
            onPress={() => onChoose("camera")}
          />
          <SourceOption
            icon="image"
            title="Tải ảnh lên"
            subtitle="Chọn ảnh có sẵn trong thư viện"
            onPress={() => onChoose("library")}
          />

          <PrimaryButton
            label="Hủy"
            variant="outline"
            onPress={onClose}
            style={{ marginTop: 4 }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ImageUploadBox({
  label,
  value,
  onChange,
  shape = "square",
  existingUri,
  disabled = false,
  frontCamera = false,
  sheetTitle,
}: Props) {
  const isCircle = shape === "circle";
  const source = useImageSource(onChange, disabled, frontCamera, isCircle);
  const previewUri = value?.uri ?? existingUri ?? null;

  const sizeStyle = isCircle
    ? { width: 160, height: 160 }
    : { aspectRatio: RATIO[shape] ?? 1 };

  const layoutClass = isCircle
    ? "rounded-full self-center"
    : shape === "square"
      ? "flex-1 rounded-2xl"
      : "w-full rounded-2xl";

  return (
    <>
      <TouchableOpacity
        onPress={source.openSheet}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
        // aspectRatio đặt qua style (Yoga xử lý trực tiếp) thay vì class
        // NativeWind "aspect-square": class này từng khiến ô ảnh co về kích
        // thước tối thiểu trong một số trường hợp re-render.
        style={[{ opacity: disabled ? 0.5 : 1 }, sizeStyle]}
        className={`items-center justify-center border-2 border-dashed overflow-hidden ${
          disabled
            ? "border-ink-muted bg-accent-light"
            : "border-accent bg-canvas"
        } ${layoutClass}`}
      >
        {previewUri ? (
          <>
            <Image
              source={{ uri: previewUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <View
              className={`absolute bottom-2 right-2 flex-row items-center rounded-full ${
                disabled ? "bg-ink-muted" : "bg-ink/90"
              } ${isCircle ? "w-8 h-8 justify-center" : "px-3 h-8"}`}
            >
              <Feather
                name={disabled ? "lock" : "camera"}
                size={13}
                color={COLORS.white}
              />
              {!isCircle && !disabled ? (
                <Text className="text-white text-xs font-bold ml-1.5">
                  Đổi ảnh
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <View className="items-center px-3">
            <View className="w-12 h-12 rounded-full bg-accent-light items-center justify-center">
              <Feather
                name="camera"
                size={22}
                color={disabled ? COLORS.inkMuted : COLORS.accentDark}
              />
            </View>
            <Text
              className={`font-bold text-sm mt-2.5 text-center ${
                disabled ? "text-ink-muted" : "text-ink"
              }`}
            >
              {label}
            </Text>
            {!isCircle && !disabled ? (
              <Text className="text-ink-muted text-xs mt-0.5 text-center">
                Chụp ảnh hoặc tải ảnh lên
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>

      <SourceSheet
        visible={source.open}
        title={sheetTitle ?? label}
        onClose={source.closeSheet}
        onChoose={source.choose}
      />
    </>
  );
}
