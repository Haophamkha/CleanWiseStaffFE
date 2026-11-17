import { ActivityIndicator, FlatList, Image, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { getErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/format";
import { pickImage } from "@/utils/imagePicker";
import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { useGetWorkerStatementsQuery, useSubmitWorkerStatementMutation, type WorkerStatement } from "../api/complaintApi";

const labels = {
  OPEN: "Chờ giải trình",
  SUBMITTED: "Đã gửi giải trình",
  EXPIRED: "Đã hết hạn phản hồi",
  CLOSED: "Đã đóng yêu cầu",
} as const;

function StatementCard({ item }: { item: WorkerStatement }) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<WorkerStatement | null>(null);
  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [picking, setPicking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submit, { isLoading }] = useSubmitWorkerStatementMutation();
  const statement = sent ?? item;
  const status = statement.status;
  const approved = status === "SUBMITTED";
  const busy = isLoading || picking;
  const images = status === "OPEN" ? photos.map(photo => photo.uri) :
    (statement.attachments ?? []).map(attachment => attachment.file);

  async function choosePhoto() {
    setPicking(true);
    setError("");
    try {
      const photo = await pickImage({ includeWebFile: true });
      if (photo) setPhotos(previous => [...previous, photo]);
    } catch (exception) {
      setError(getErrorMessage(exception, t));
    } finally {
      setPicking(false);
    }
  }

  async function send() {
    setError("");
    try {
      const result = await submit({ id: item.id, response: message.trim(), photos }).unwrap();
      setSent(result);
      setPhotos([]);
    } catch (exception) {
      setError(getErrorMessage(exception, t));
    }
  }

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text className="font-bold text-ink">{item.complaint_code}</Text>
        <Text className={`rounded-full px-2.5 py-1 text-xs font-bold ${approved ? "bg-success-light text-success" : status === "OPEN" ? "bg-primary-soft text-primary-dark" : "bg-surface-soft text-ink-soft"}`}>
          {t(labels[status])}
        </Text>
      </View>
      <Text className="text-sm text-ink-soft">{t("Đơn")} {item.booking_code}{item.sequence !== null && ` · ${t("Buổi")} ${item.sequence}`}</Text>
      <View className="flex-row items-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5">
        <Feather name="clock" size={15} color={COLORS.primary} />
        <Text className="flex-1 text-sm font-semibold text-primary-dark">{t("Hạn phản hồi")} · {formatDateTime(item.due_at, t)}</Text>
      </View>
      <Text className="text-sm leading-5 text-ink">{item.request_message}</Text>
      {images.length > 0 && (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-ink-soft">{t("Ảnh minh chứng ({{value0}})", { value0: images.length })}</Text>
          <View className="flex-row flex-wrap gap-2">
            {images.map((uri, index) => (
              <View key={`${uri}-${index}`}>
                <Pressable accessibilityRole="button" accessibilityLabel={t("Xem ảnh minh chứng")} onPress={() => setPreview(uri)}>
                  <Image source={{ uri }} className="size-16 rounded-lg bg-surface-soft" />
                </Pressable>
                {status === "OPEN" && (
                  <Pressable accessibilityRole="button" accessibilityLabel={t("Xóa ảnh minh chứng")}
                    disabled={busy} onPress={() => setPhotos(previous => previous.filter((_, position) => position !== index))}
                    className="absolute right-0 top-0 rounded-full bg-surface p-1">
                    <Feather name="x" size={14} color={COLORS.ink} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
      {status === "OPEN" && (
        <View className="gap-2">
          <TextInput
            accessibilityLabel={t("Nội dung giải trình")}
            placeholder={t("Nội dung giải trình")}
            placeholderTextColor={COLORS.inkMuted}
            className="min-h-24 rounded-xl border border-line bg-canvas p-3 text-ink"
            editable={!busy}
            multiline
            maxLength={2000}
            value={message}
            onChangeText={setMessage}
          />
          {photos.length < 5 && (
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void choosePhoto()}
              className="self-start rounded-xl border border-line bg-surface px-4 py-2.5">
              <Text className="font-semibold text-ink">{t("Thêm ảnh minh chứng")}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy || (!message.trim() && photos.length === 0)}
            className="self-start rounded-xl bg-primary-fill px-4 py-3 disabled:opacity-50"
            onPress={() => void send()}
          >
            <Text className="font-bold text-white">{t("Gửi giải trình")}</Text>
          </Pressable>
        </View>
      )}
      {approved && (
        <View className="gap-1 rounded-xl bg-surface-soft p-3">
          {!!statement.response && <>
            <Text className="text-xs font-semibold text-ink-soft">{t("Nội dung giải trình")}</Text>
            <Text className="text-sm leading-5 text-ink">{statement.response}</Text>
          </>}
          {statement.submitted_at && <Text className="text-xs text-ink-soft">{formatDateTime(statement.submitted_at, t)}</Text>}
        </View>
      )}
      {!!error && <Text accessibilityRole="alert" className="text-sm text-danger">{error}</Text>}
      {preview && (
        <Modal transparent animationType="fade" onRequestClose={() => setPreview(null)}>
          <View className="flex-1 justify-center bg-black/90 p-4">
            <Pressable accessibilityRole="button" accessibilityLabel={t("Đóng")} onPress={() => setPreview(null)}
              className="self-end rounded-full bg-white/20 p-3">
              <Feather name="x" size={22} color="white" />
            </Pressable>
            <Image source={{ uri: preview }} resizeMode="contain" className="min-h-0 w-full flex-1" />
          </View>
        </Modal>
      )}
    </View>
  );
}

export function WorkerStatementPanel() {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const { data, isLoading, isFetching, isError, refetch } = useGetWorkerStatementsQuery(undefined, {
    pollingInterval: 15000, refetchOnMountOrArgChange: true,
  });
  if (isError && !data) {
    return <EmptyState icon="alert-circle" title={t("Không tải được yêu cầu giải trình")} actionLabel={t("Thử lại")} onAction={refetch} />;
  }
  if (isLoading) return <ActivityIndicator color={COLORS.primary} className="mt-5" />;
  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshing={isFetching}
      onRefresh={refetch}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, paddingBottom: 24 + bottom, gap: 12 }}
      ListEmptyComponent={<EmptyState icon="check-circle" title={t("Chưa có yêu cầu giải trình")} />}
      renderItem={({ item }) => <StatementCard item={item} />}
    />
  );
}
