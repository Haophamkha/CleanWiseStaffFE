import { DetailHeader } from "@/components/common/DetailHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { ENV } from "@/config/env";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import {
    useCancelComplaintMutation,
    useGetComplaintDetailQuery,
} from "@/features/complaint/api/complaintApi";
import { ComplaintStatusBadge } from "@/features/complaint/components/ComplaintStatusBadge";
import { getErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/format";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const toUrl = (file: string) =>
  file.startsWith("http") ? file : `${ENV.API_URL}${file}`;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-surface border border-line p-4 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <Text className="text-ink-muted text-xs font-semibold mb-2">{title}</Text>
      {children}
    </View>
  );
}

export default function ComplaintDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const complaintId = Number(id);

  const { data, isLoading } = useGetComplaintDetailQuery(complaintId);
  const [cancelComplaint, { isLoading: cancelling }] =
    useCancelComplaintMutation();
  const [confirm, setConfirm] = useState(false);

  const onCancel = async () => {
    try {
      await cancelComplaint(complaintId).unwrap();
      setConfirm(false);
      showSuccessToast("Đã hủy khiếu nại");
    } catch (e) {
      setConfirm(false);
      showErrorToast("Không hủy được", getErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-5">
        <EmptyState
          icon="alert-circle"
          title="Không tìm thấy khiếu nại"
          actionLabel="Quay lại"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const canCancel = data.status === "PENDING";

  return (
    <View className="flex-1 bg-canvas">
      <DetailHeader
        title="Chi tiết khiếu nại"
        subtitle={`#${data.id}`}
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40 + insets.bottom,
        }}
      >
        <Section title="Loại sự cố">
          <Text className="text-ink text-base font-extrabold mb-3">
            {data.issue_type_name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-ink-soft text-xs">
              {data.stage_label} · {formatDateTime(data.created_at)}
            </Text>
            <ComplaintStatusBadge
              status={data.status}
              label={data.status_label}
            />
          </View>
        </Section>

        {data.content ? (
          <Section title="Mô tả">
            <Text className="text-ink text-sm leading-5">{data.content}</Text>
          </Section>
        ) : null}

        {data.attachments?.length ? (
          <Section title={`Ảnh minh chứng (${data.attachments.length})`}>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {data.attachments.map((a) => (
                <Image
                  key={a.id}
                  source={{ uri: toUrl(a.file) }}
                  style={{ width: 96, height: 96, borderRadius: 14 }}
                />
              ))}
            </View>
          </Section>
        ) : null}

        {data.resolution_note ? (
          <Section title="Phản hồi từ CleanWise">
            <Text className="text-ink text-sm leading-5">
              {data.resolution_note}
            </Text>
            {data.resolved_at ? (
              <Text className="text-ink-muted text-xs mt-2">
                {formatDateTime(data.resolved_at)}
              </Text>
            ) : null}
          </Section>
        ) : null}

        {canCancel ? (
          <PressableScale
            onPress={() => setConfirm(true)}
            accessibilityRole="button"
            className="flex-row border border-danger rounded-full items-center justify-center"
            style={{ height: 48 }}
          >
            <Feather name="x-circle" size={16} color={COLORS.danger} />
            <Text className="text-danger text-xs ml-2 font-extrabold">
              HỦY KHIẾU NẠI
            </Text>
          </PressableScale>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={confirm}
        tone="danger"
        icon="alert-triangle"
        title="Hủy khiếu nại?"
        message="Bạn không thể khôi phục sau khi hủy."
        confirmLabel="Hủy khiếu nại"
        cancelLabel="Giữ lại"
        loading={cancelling}
        onConfirm={onCancel}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}
