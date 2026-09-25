import { Feather } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { ImageUploadBox } from "@/components/profile-setup/ImageUploadBox";
import type { ScheduleImage, ScheduleImageType } from "@/types/Schedule";
import type { PickedFile } from "@/types/WorkerProfile";

const UPLOAD_IMAGE_SLOTS: { type: ScheduleImageType; label: string }[] = [
  { type: "BEFORE", label: "Trước khi làm" },
  { type: "AFTER", label: "Sau khi làm" },
  { type: "ISSUE", label: "Vấn đề phát sinh" },
];

const THUMB_SIZE = 92;

function ExistingThumb({ uri }: { uri: string }) {
  return (
    <View
      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      className="rounded-2xl overflow-hidden border border-[#F3F4F6] bg-[#F3F4F6]"
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}

function StagedThumb({
  uri,
  disabled,
  onRemove,
}: {
  uri: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        opacity: disabled ? 0.6 : 1,
      }}
      className="rounded-2xl overflow-hidden border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB]"
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      {!disabled ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="absolute top-1 right-1 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(17,24,39,0.75)" }}
        >
          <Feather name="x" size={14} color="#fff" />
        </Pressable>
      ) : null}
      {disabled ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
        >
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : null}
    </View>
  );
}

type Props = {
  images: ScheduleImage[];
  canEdit: boolean;
  localImages: Partial<Record<ScheduleImageType, PickedFile[]>>;
  /** true khi đang trong bước gửi ảnh (ngay trước lúc check-out) — khóa
   * toàn bộ thao tác thêm/xóa ảnh, hiện loading trên từng ảnh chờ. */
  isUploadingImages?: boolean;
  onPickImage: (type: ScheduleImageType, file: PickedFile) => void;
  onRemoveImage: (type: ScheduleImageType, uri: string) => void;
};

export function ProofImagesSection({
  images,
  canEdit,
  localImages,
  isUploadingImages = false,
  onPickImage,
  onRemoveImage,
}: Props) {
  const hasPendingAny = Object.values(localImages).some(
    (files) => (files?.length ?? 0) > 0,
  );

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
      <Text className="text-[#111827] text-base font-bold mb-1">
        Ảnh minh chứng
      </Text>
      <Text className="text-[#9CA3AF] text-xs mb-3">
        {canEdit
          ? hasPendingAny
            ? 'Ảnh sẽ được gửi khi bạn bấm "Hoàn thành công việc". Có thể xóa (X) ảnh chưa ưng.'
            : "Chụp ảnh trước và sau khi làm để lưu lại minh chứng công việc."
          : "Ảnh minh chứng đã ghi nhận cho buổi làm này."}
      </Text>

      {UPLOAD_IMAGE_SLOTS.map(({ type, label }, index) => {
        const existing = images.filter((img) => img.image_type === type);
        const pending = localImages[type] ?? [];
        const hasAnyImage = existing.length > 0 || pending.length > 0;
        const isLastRow = index === UPLOAD_IMAGE_SLOTS.length - 1;

        if (!canEdit && !hasAnyImage) return null;

        return (
          <View key={type} className={isLastRow ? "" : "mb-4"}>
            <Text className="text-[#374151] text-sm font-semibold mb-2">
              {label}
              {existing.length > 0 ? ` (${existing.length})` : ""}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {existing.map((img) => (
                <ExistingThumb key={`existing-${img.id}`} uri={img.image} />
              ))}

              {pending.map((file) => (
                <StagedThumb
                  key={`pending-${type}-${file.uri}`}
                  uri={file.uri}
                  disabled={isUploadingImages}
                  onRemove={() => onRemoveImage(type, file.uri)}
                />
              ))}

              {canEdit ? (
                <View
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    opacity: isUploadingImages ? 0.5 : 1,
                  }}
                  pointerEvents={isUploadingImages ? "none" : "auto"}
                >
                  <ImageUploadBox
                    label="Thêm"
                    value={null}
                    existingUri={null}
                    onChange={(file) => onPickImage(type, file)}
                  />
                </View>
              ) : null}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}
