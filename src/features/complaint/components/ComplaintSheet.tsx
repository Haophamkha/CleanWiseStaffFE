import { PressableScale } from "@/components/ui/PressableScale";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { COLORS, RADIUS } from "@/constants/theme";
import {
    useCreateComplaintMutation,
    useGetComplaintIssueTypesQuery,
} from "@/features/complaint/api/complaintApi";
import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { getErrorMessage } from "@/utils/apiError";
import { pickImage, takePhoto } from "@/utils/imagePicker";
import { showErrorToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_IMAGES = 5;

type Props = {
  visible: boolean;
  bookingId: number;
  scheduleId: number;
  onClose: () => void;
};

export function ComplaintSheet({
  visible,
  bookingId,
  scheduleId,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { data: types = [], isLoading } = useGetComplaintIssueTypesQuery(
    undefined,
    { skip: !visible },
  );
  const [createComplaint, { isLoading: submitting }] =
    useCreateComplaintMutation();

  const [issueTypeId, setIssueTypeId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PickedFile[]>([]);
  const [done, setDone] = useState(false);

  const reset = () => {
    setIssueTypeId(null);
    setContent("");
    setImages([]);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const addImage = async (fromCamera: boolean) => {
    if (images.length >= MAX_IMAGES) return;
    const file = fromCamera ? await takePhoto() : await pickImage();
    if (file) setImages((prev) => [...prev, file]);
  };

  const submit = async () => {
    if (!issueTypeId || submitting) return;
    try {
      await createComplaint({
        bookingId,
        scheduleId,
        issueTypeId,
        content,
        images,
      }).unwrap();
      reset();
      onClose();
      setDone(true);
    } catch (e) {
      showErrorToast("Không gửi được khiếu nại", getErrorMessage(e));
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <Pressable className="flex-1" onPress={close} />
          <View
            className="bg-surface px-5 pt-4"
            style={{
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              maxHeight: "88%",
              paddingBottom: 16 + insets.bottom,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-danger-light items-center justify-center mr-3">
                <Feather name="alert-circle" size={18} color={COLORS.danger} />
              </View>
              <Text className="text-ink text-base font-extrabold flex-1">
                Báo sự cố / Khiếu nại
              </Text>
              <Pressable onPress={close} hitSlop={10}>
                <Feather name="x" size={22} color={COLORS.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-ink text-sm font-semibold mb-2">
                Loại sự cố
              </Text>
              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                  {types.map((t) => {
                    const active = issueTypeId === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => setIssueTypeId(t.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={`rounded-full px-3.5 justify-center border ${
                          active
                            ? "bg-ink border-ink"
                            : "bg-surface border-line"
                        }`}
                        style={{ minHeight: 36 }}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            active ? "text-white" : "text-ink-soft"
                          }`}
                        >
                          {t.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text className="text-ink text-sm font-semibold mb-2">
                Mô tả
                <Text className="text-ink-muted font-normal">
                  {" "}
                  (không bắt buộc)
                </Text>
              </Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Ví dụ: Khách không thanh toán tiền mặt sau khi hoàn thành..."
                placeholderTextColor={COLORS.inkMuted}
                multiline
                maxLength={1000}
                editable={!submitting}
                className="border border-line bg-canvas rounded-2xl px-3.5 py-3 text-sm text-ink"
                style={{ minHeight: 90, textAlignVertical: "top" }}
              />
              <Text className="text-ink-muted text-xs text-right mt-1.5 mb-3">
                {content.length}/1000
              </Text>

              <Text className="text-ink text-sm font-semibold mb-2">
                Ảnh minh chứng
                <Text className="text-ink-muted font-normal">
                  {" "}
                  ({images.length}/{MAX_IMAGES})
                </Text>
              </Text>
              <View className="flex-row flex-wrap mb-4" style={{ gap: 10 }}>
                {images.map((img, i) => (
                  <View key={`${img.uri}-${i}`}>
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 72, height: 72, borderRadius: 14 }}
                    />
                    <Pressable
                      onPress={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      hitSlop={6}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger items-center justify-center"
                    >
                      <Feather name="x" size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {images.length < MAX_IMAGES ? (
                  <>
                    <Pressable
                      onPress={() => addImage(true)}
                      className="items-center justify-center border border-dashed border-line rounded-2xl bg-canvas"
                      style={{ width: 72, height: 72 }}
                    >
                      <Feather name="camera" size={20} color={COLORS.inkSoft} />
                    </Pressable>
                    <Pressable
                      onPress={() => addImage(false)}
                      className="items-center justify-center border border-dashed border-line rounded-2xl bg-canvas"
                      style={{ width: 72, height: 72 }}
                    >
                      <Feather name="image" size={20} color={COLORS.inkSoft} />
                    </Pressable>
                  </>
                ) : null}
              </View>
            </ScrollView>

            <PressableScale
              onPress={submit}
              disabled={!issueTypeId || submitting}
              accessibilityRole="button"
              className="bg-danger rounded-full items-center justify-center mt-2"
              style={{
                height: 48,
                opacity: !issueTypeId || submitting ? 0.45 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-xs font-extrabold">
                  GỬI KHIẾU NẠI
                </Text>
              )}
            </PressableScale>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={done}
        title="Đã gửi khiếu nại"
        message="CleanWise sẽ xem xét và phản hồi sớm nhất."
        onClose={() => setDone(false)}
      />
    </>
  );
}
