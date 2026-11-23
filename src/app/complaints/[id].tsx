import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { ENV } from "@/config/env";
import { RADIUS } from "@/constants/theme";
import {
  useCancelComplaintMutation,
  useGetComplaintDetailQuery,
} from "@/features/complaint/api/complaintApi";
import { ComplaintStatusBadge } from "@/features/complaint/components/ComplaintStatusBadge";
import { getErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { goBackOrReplace } from "@/utils/navigation";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const toUrl = (file: string) =>
  file.startsWith("http") ? file : `${ENV.API_URL}${file}`;

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-canvas border border-line p-4 mb-3"
      style={{ borderRadius: 18 }}
    >
      <Text className="text-ink-muted text-xs font-semibold mb-2">{title}</Text>
      {children}
    </View>
  );
}

export default function ComplaintDetailScreen() {
  const { t: tr } = useTranslation();
  const { COLORS, OVERLAY } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const complaintId = Number(id);

  const { data, isLoading } = useGetComplaintDetailQuery(complaintId);
  const [cancelComplaint, { isLoading: cancelling }] =
    useCancelComplaintMutation();
  const [confirm, setConfirm] = useState(false);

  const close = () => goBackOrReplace("/complaints");

  const onCancel = async () => {
    try {
      await cancelComplaint(complaintId).unwrap();
      setConfirm(false);
      showSuccessToast(tr("\u0110\u00e3 h\u1ee7y khi\u1ebfu n\u1ea1i"));
    } catch (e) {
      setConfirm(false);
      showErrorToast(tr("Kh\u00f4ng h\u1ee7y \u0111\u01b0\u1ee3c"), getErrorMessage(e, tr));
    }
  };

  const canCancel = data?.status === "PENDING";
  const amount = Number(data?.my_amount ?? 0);
  const showAmount = data?.status === "RESOLVED" && amount !== 0;

  return (
    <View style={{ flex: 1, backgroundColor: OVERLAY, justifyContent: "center", paddingHorizontal: 20 }}>
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={tr("Quay l\u1ea1i")}
      />

      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.sheet,
          maxHeight: "80%",
          paddingBottom: 12,
        }}
      >

        <View className="flex-row items-center px-5 pt-3 pb-3">
          <View className="w-10 h-10 rounded-full bg-danger-light items-center justify-center mr-3">
            <Feather name="alert-circle" size={18} color={COLORS.danger} />
          </View>
          <View className="flex-1">
            <Text className="text-ink text-base font-extrabold">
              {tr("Chi ti\u1ebft khi\u1ebfu n\u1ea1i")}
            </Text>
            {!!data && (
              <Text selectable className="text-ink-muted text-xs mt-0.5" numberOfLines={1}>
                {data.code ?? `#${data.id}`}
              </Text>
            )}
          </View>
          <Pressable
            onPress={close}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={tr("Quay l\u1ea1i")}
          >
            <Feather name="x" size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 48 }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : !data ? (
          <View className="px-5 pb-4">
            <EmptyState
              icon="alert-circle"
              title={tr("Kh\u00f4ng t\u00ecm th\u1ea5y khi\u1ebfu n\u1ea1i")}
              actionLabel={tr("Quay l\u1ea1i")}
              onAction={close}
            />
          </View>
        ) : (
          <ScrollView
            style={{ flexGrow: 0 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}
          >
            <Block title={tr("Lo\u1ea1i s\u1ef1 c\u1ed1")}>
              <Text className="text-ink text-base font-extrabold mb-1">
                {data.issue_type_name}
              </Text>
              <Text
                className="text-ink-soft text-xs mb-3"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {data.booking_code
                  ? tr("\u0110\u01a1n {{value0}}", { value0: data.booking_code })
                  : tr("\u0110\u01a1n #{{value0}}", { value0: data.booking })}
                {data.schedule_sequence_no
                  ? tr(" \u00b7 Bu\u1ed5i {{value0}}", { value0: data.schedule_sequence_no })
                  : ""}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-ink-soft text-xs flex-1 pr-2">
                  {data.stage_label} · {formatDateTime(data.created_at, tr)}
                </Text>
                <ComplaintStatusBadge status={data.status} label={data.status_label} />
              </View>
            </Block>

            {data.content ? (
              <Block title={tr("M\u00f4 t\u1ea3")}>
                <Text className="text-ink text-sm leading-5">{data.content}</Text>
              </Block>
            ) : null}

            {data.attachments?.length ? (
              <Block title={tr("\u1ea2nh minh ch\u1ee9ng ({{value0}})", { value0: data.attachments.length })}>
                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                  {data.attachments.map((a) => (
                    <Image
                      key={a.id}
                      source={{ uri: toUrl(a.file) }}
                      style={{ width: 88, height: 88, borderRadius: 14 }}
                    />
                  ))}
                </View>
              </Block>
            ) : null}

            {data.resolution_note ? (
              <Block title={tr("Ph\u1ea3n h\u1ed3i t\u1eeb CleanWise")}>
                <Text className="text-ink text-sm leading-5">{data.resolution_note}</Text>
                {data.resolved_at ? (
                  <Text className="text-ink-muted text-xs mt-2">
                    {formatDateTime(data.resolved_at, tr)}
                  </Text>
                ) : null}
              </Block>
            ) : null}

            {showAmount ? (
              <Block title={tr("K\u1ebft qu\u1ea3 x\u1eed l\u00fd")}>
                <Text
                  className={`text-base font-extrabold ${
                    amount > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {amount > 0 ? "+" : "-"}
                  {formatCurrency(String(Math.abs(amount)), tr) ?? ""}
                </Text>
                <Text className="text-ink-muted text-xs mt-1">
                  {amount > 0
                    ? tr("\u0110\u00e3 c\u1ed9ng v\u00e0o v\u00ed c\u1ee7a b\u1ea1n.")
                    : tr("\u0110\u00e3 tr\u1eeb kh\u1ecfi v\u00ed c\u1ee7a b\u1ea1n.")}
                </Text>
              </Block>
            ) : null}

            {canCancel ? (
              <PressableScale
                onPress={() => setConfirm(true)}
                accessibilityRole="button"
                className="flex-row border border-danger rounded-full items-center justify-center mt-1"
                style={{ height: 48 }}
              >
                <Feather name="x-circle" size={16} color={COLORS.danger} />
                <Text className="text-danger text-xs ml-2 font-extrabold">
                  {tr("H\u1ee6Y KHI\u1ebeU N\u1ea0I")}
                </Text>
              </PressableScale>
            ) : null}
          </ScrollView>
        )}
      </View>

      <ConfirmModal
        visible={confirm}
        tone="danger"
        icon="alert-triangle"
        title={tr("H\u1ee7y khi\u1ebfu n\u1ea1i?")}
        message={tr("B\u1ea1n kh\u00f4ng th\u1ec3 kh\u00f4i ph\u1ee5c sau khi h\u1ee7y.")}
        confirmLabel={tr("H\u1ee7y khi\u1ebfu n\u1ea1i")}
        cancelLabel={tr("Gi\u1eef l\u1ea1i")}
        loading={cancelling}
        onConfirm={onCancel}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}