import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import {
  getRejectedSteps,
  stepRoute,
} from "@/features/profile-setup/utils/rejectionFlow";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Notice = {
  icon: ComponentProps<typeof Feather>["name"];
  color: string;
  bg: string;
  title: string;
  description: string;
  /** "profile": đi tới bước hồ sơ cần làm; "refresh": tải lại trạng thái; null: không có nút */
  action: "profile" | "refresh" | null;
  actionLabel?: string;
};

/**
 * Chỉ render `children` khi hồ sơ nhân viên ở trạng thái ACTIVE.
 * Các trạng thái khác hiện thông báo tương ứng. Vì children chỉ được mount
 * khi ACTIVE nên các query bên trong (jobs, schedules...) cũng không chạy
 * khi hồ sơ chưa được duyệt.
 */
export function ActiveProfileGate({
  children,
  copy,
}: {
  children: ReactNode;
  /** Ghi đè mô tả theo từng trang (mặc định dùng chữ về nhận việc / lịch làm). */
  copy?: { draft?: string; pending?: string };
}) {
  const { t: tr } = useTranslation();

const { COLORS } = useAppTheme();
  const NOTICES: Record<string, Notice> = {
    DRAFT: {
      icon: "edit-3",
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      title: tr("Bạn chưa hoàn tất hồ sơ"),
      description:
        tr("Hãy hoàn tất hồ sơ và gửi duyệt để bắt đầu nhận việc và xem lịch làm."),
      action: "profile",
      actionLabel: tr("Hoàn tất hồ sơ"),
    },
    PENDING: {
      icon: "clock",
      color: COLORS.warning,
      bg: COLORS.accentLight,
      title: tr("Hồ sơ đang chờ duyệt"),
      description:
        tr("Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhận việc được sau khi hồ sơ được duyệt."),
      action: "refresh",
      actionLabel: tr("Kiểm tra lại"),
    },
    REJECTED: {
      icon: "x-circle",
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      title: tr("Hồ sơ bị từ chối"),
      description:
        tr("Hồ sơ của bạn cần chỉnh sửa. Vui lòng cập nhật theo yêu cầu rồi gửi duyệt lại."),
      action: "profile",
      actionLabel: tr("Sửa hồ sơ"),
    },
    SUSPENDED: {
      icon: "lock",
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      title: tr("Tài khoản đang bị tạm khóa"),
      description: tr("Vui lòng liên hệ quản trị viên để được hỗ trợ."),
      action: null,
    },
  };

  const FALLBACK_NOTICE: Notice = {
    icon: "alert-circle",
    color: COLORS.inkSoft,
    bg: COLORS.surfaceMuted,
    title: tr("Tài khoản chưa sẵn sàng"),
    description: tr("Hồ sơ của bạn chưa được kích hoạt để nhận việc."),
    action: "refresh",
    actionLabel: tr("Kiểm tra lại"),
  };


  const insets = useSafeAreaInsets();
  const {
    data: profile,
    isLoading,
    isFetching,
    refetch,
  } = useGetWorkerProfileQuery();

  if (!profile) {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-canvas">
          <ActivityIndicator color={COLORS.info} size="large" />
        </View>
      );
    }
    return (
      <View
        className="flex-1 items-center justify-center bg-canvas px-8"
        style={{ paddingTop: insets.top }}
      >
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
          <Feather name="alert-circle" size={30} color={COLORS.danger} />
        </View>
        <Text className="text-ink font-bold text-base mt-4">
          {tr("Không tải được hồ sơ")}</Text>
        <Text className="text-ink-soft text-center mt-2">
          {tr("Kiểm tra kết nối và thử lại.")}</Text>
        <TouchableOpacity
          className="bg-info-fill rounded-xl px-5 py-3 mt-5"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">{tr("Thử lại")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profile.status === "ACTIVE") {
    return <>{children}</>;
  }

  const approvalWasRevoked =
    profile.status === "DRAFT" && !!profile.rejection_reason;
  const baseNotice: Notice = approvalWasRevoked
    ? {
        ...NOTICES.DRAFT,
        title: tr("Phê duyệt hồ sơ đã được thu hồi"),
        description:
          tr("Vui lòng kiểm tra hồ sơ, cập nhật nếu cần và gửi lại để quản trị viên xét duyệt."),
        actionLabel: tr("Cập nhật và gửi lại"),
      }
    : (NOTICES[profile.status] ?? FALLBACK_NOTICE);
  const override =
    profile.status === "DRAFT" && !approvalWasRevoked
      ? copy?.draft
      : profile.status === "PENDING"
        ? copy?.pending
        : undefined;
  const notice = override
    ? { ...baseNotice, description: override }
    : baseNotice;

  const reason =
    profile.status === "REJECTED" || approvalWasRevoked
      ? profile.rejection_reason
      : null;

  const handleAction = () => {
    if (notice.action === "profile") {
      if (profile.status === "REJECTED") {
        const firstStep =
          getRejectedSteps(profile.rejected_fields)[0] ?? "portrait";
        router.push(stepRoute(firstStep));
      } else {
        router.push(stepRoute("portrait"));
      }
      return;
    }
    refetch();
  };

  return (
    <View
      className="flex-1 items-center justify-center bg-canvas px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}
    >
      <View
        className="w-20 h-20 rounded-full items-center justify-center"
        style={{ backgroundColor: notice.bg }}
      >
        <Feather name={notice.icon} size={34} color={notice.color} />
      </View>

      <Text className="text-ink text-xl font-bold mt-5 text-center">
        {notice.title}
      </Text>
      <Text className="text-ink-soft text-[15px] leading-5 mt-2 text-center">
        {notice.description}
      </Text>

      {!!reason && (
        <View className="mt-4 bg-surface border border-line rounded-2xl px-4 py-3 self-stretch">
          <Text className="text-ink-muted text-xs mb-1">
            {approvalWasRevoked ? tr("Lý do thu hồi phê duyệt") : tr("Lý do từ chối")}
          </Text>
          <Text className="text-danger text-sm">{reason}</Text>
        </View>
      )}

      {notice.action && (
        <TouchableOpacity
          className="bg-info-fill rounded-2xl px-6 py-3.5 mt-6"
          onPress={handleAction}
          disabled={notice.action === "refresh" && isFetching}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-[15px]">
            {notice.action === "refresh" && isFetching
              ? tr("Đang kiểm tra...")
              : notice.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
