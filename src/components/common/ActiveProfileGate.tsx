import { useGetWorkerProfileQuery } from "@/services/authApi";
import { getRejectedSteps, stepRoute } from "@/utils/rejectionFlow";
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

const NOTICES: Record<string, Notice> = {
  DRAFT: {
    icon: "edit-3",
    color: "#DC2626",
    bg: "#FEE2E2",
    title: "Bạn chưa hoàn tất hồ sơ",
    description:
      "Hãy hoàn tất hồ sơ và gửi duyệt để bắt đầu nhận việc và xem lịch làm.",
    action: "profile",
    actionLabel: "Hoàn tất hồ sơ",
  },
  PENDING: {
    icon: "clock",
    color: "#D97706",
    bg: "#FEF3C7",
    title: "Hồ sơ đang chờ duyệt",
    description:
      "Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhận việc được sau khi hồ sơ được duyệt.",
    action: "refresh",
    actionLabel: "Kiểm tra lại",
  },
  REJECTED: {
    icon: "x-circle",
    color: "#DC2626",
    bg: "#FEE2E2",
    title: "Hồ sơ bị từ chối",
    description:
      "Hồ sơ của bạn cần chỉnh sửa. Vui lòng cập nhật theo yêu cầu rồi gửi duyệt lại.",
    action: "profile",
    actionLabel: "Sửa hồ sơ",
  },
  SUSPENDED: {
    icon: "lock",
    color: "#DC2626",
    bg: "#FEE2E2",
    title: "Tài khoản đang bị tạm khóa",
    description: "Vui lòng liên hệ quản trị viên để được hỗ trợ.",
    action: null,
  },
};

const FALLBACK_NOTICE: Notice = {
  icon: "alert-circle",
  color: "#6B7280",
  bg: "#F3F4F6",
  title: "Tài khoản chưa sẵn sàng",
  description: "Hồ sơ của bạn chưa được kích hoạt để nhận việc.",
  action: "refresh",
  actionLabel: "Kiểm tra lại",
};

/**
 * Chỉ render `children` khi hồ sơ nhân viên ở trạng thái ACTIVE.
 * Các trạng thái khác hiện thông báo tương ứng. Vì children chỉ được mount
 * khi ACTIVE nên các query bên trong (jobs, schedules...) cũng không chạy
 * khi hồ sơ chưa được duyệt.
 */
export function ActiveProfileGate({ children }: { children: ReactNode }) {
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
        <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      );
    }
    return (
      <View
        className="flex-1 items-center justify-center bg-[#F8F9FC] px-8"
        style={{ paddingTop: insets.top }}
      >
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
          <Feather name="alert-circle" size={30} color="#DC2626" />
        </View>
        <Text className="text-[#111827] font-bold text-base mt-4">
          Không tải được hồ sơ
        </Text>
        <Text className="text-[#6B7280] text-center mt-2">
          Kiểm tra kết nối và thử lại.
        </Text>
        <TouchableOpacity
          className="bg-[#2563EB] rounded-xl px-5 py-3 mt-5"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profile.status === "ACTIVE") {
    return <>{children}</>;
  }

  const notice = NOTICES[profile.status] ?? FALLBACK_NOTICE;
  // rejection_reason có trong response của BE; ép any để không phụ thuộc type
  const reason =
    profile.status === "REJECTED"
      ? ((profile as any).rejection_reason as string | null | undefined)
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
      className="flex-1 items-center justify-center bg-[#F8F9FC] px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}
    >
      <View
        className="w-20 h-20 rounded-full items-center justify-center"
        style={{ backgroundColor: notice.bg }}
      >
        <Feather name={notice.icon} size={34} color={notice.color} />
      </View>

      <Text className="text-[#111827] text-xl font-bold mt-5 text-center">
        {notice.title}
      </Text>
      <Text className="text-[#6B7280] text-[15px] leading-5 mt-2 text-center">
        {notice.description}
      </Text>

      {!!reason && (
        <View className="mt-4 bg-white border border-[#FECACA] rounded-2xl px-4 py-3 self-stretch">
          <Text className="text-[#9CA3AF] text-xs mb-1">Lý do từ chối</Text>
          <Text className="text-[#DC2626] text-sm">{reason}</Text>
        </View>
      )}

      {notice.action && (
        <TouchableOpacity
          className="bg-[#2563EB] rounded-2xl px-6 py-3.5 mt-6"
          onPress={handleAction}
          disabled={notice.action === "refresh" && isFetching}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-[15px]">
            {notice.action === "refresh" && isFetching
              ? "Đang kiểm tra..."
              : notice.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
