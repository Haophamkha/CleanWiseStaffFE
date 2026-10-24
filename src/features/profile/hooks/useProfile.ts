import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";

import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import type { ProfileStatus } from "@/features/profile-setup/types/WorkerProfile";
import { performLogout } from "@/store/baseApi";
import { resolveMediaUrl } from "@/utils/media";
import type { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";

type FeatherName = ComponentProps<typeof Feather>["name"];

export type ProfileStatusInfo = {
  label: string;
  color: string;
  bg: string;
  text: string;
};

export type MenuItem = {
  icon: FeatherName;
  label: string;
  onPress?: () => void;
};

export type MenuGroup = {
  title: string;
  layout: "list" | "shortcuts" | "support";
  items: MenuItem[];
};

export function getProfileStatusInfo(COLORS: ThemeColors): Record<ProfileStatus, ProfileStatusInfo> { return {
  DRAFT: {
    label: tr("Chưa hoàn tất hồ sơ"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  PENDING: {
    label: tr("Đang chờ duyệt"),
    color: COLORS.warning,
    bg: COLORS.warningLight,
    text: COLORS.warningDark,
  },
  ACTIVE: {
    label: tr("Đang làm việc"),
    color: COLORS.success,
    bg: COLORS.successLight,
    text: COLORS.success,
  },
  REJECTED: {
    label: tr("Hồ sơ bị từ chối"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  SUSPENDED: {
    label: tr("Tạm khóa"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
}; }

function buildMenuGroups(): MenuGroup[] {
  return [
    {
      title: tr("Tài khoản & công việc"),
      layout: "list",
      items: [
        {
          icon: "user",
          label: tr("Thông tin cá nhân"),
          onPress: () => router.push("/(profile-setup)/personal-info"),
        },
        {
          icon: "map-pin",
          label: tr("Khu vực hoạt động"),
          onPress: () => router.push("/(profile-setup)/working-areas"),
        },
        {
          icon: "folder",
          label: tr("Hồ sơ của tôi"),
          onPress: () => router.push("/(profile-setup)/my-profile"),
        },
        {
          icon: "alert-circle",
          label: tr("Khiếu nại của tôi"),
          onPress: () => router.push("/complaints" as any),
        },
      ],
    },
    {
      title: tr("Tài chính"),
      layout: "shortcuts",
      items: [
        {
          icon: "trending-up",
          label: tr("Thu nhập"),
          onPress: () => router.push("/earnings" as any),
        },
        {
          icon: "credit-card",
          label: tr("Tài khoản ngân hàng"),
          onPress: () => router.push("/payment-methods" as any),
        },
      ],
    },
    {
      title: tr("Ứng dụng"),
      layout: "support",
      items: [
        { icon: "settings", label: tr("Cài đặt"), onPress: () => router.push("/settings" as any) },
        {
          icon: "info",
          label: tr("Về CleanWise"),
          onPress: () => router.push("/about" as any),
        },
      ],
    },
  ];
}

export function useProfile() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const { data: profile, isLoading, isError } = useGetWorkerProfileQuery();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username
    : "";

  const avatarUri = resolveMediaUrl(profile?.portrait);

  const rating = profile?.average_rating ? Number(profile.average_rating) : 0;

  const statusInfo: ProfileStatusInfo | null = profile
    ? (getProfileStatusInfo(COLORS)[profile.status] ?? {
        label: profile.status,
        color: COLORS.inkSoft,
        bg: COLORS.accentLight,
        text: COLORS.inkSoft,
      })
    : null;

  // Logic đăng xuất gốc, giữ nguyên
  const handleLogout = () => {
    performLogout();
  };

  // Bấm nút "Đăng xuất" -> hỏi xác nhận trước
  const requestLogout = () => setLogoutConfirmVisible(true);
  const cancelLogout = () => setLogoutConfirmVisible(false);
  const confirmLogout = () => {
    setLogoutConfirmVisible(false);
    handleLogout();
  };

  return {
    isLoading,
    isError,
    fullName: fullName || tr("Nhân viên"),
    phone: profile?.phone_number ?? "",
    avatarUri,
    ratingText: rating.toFixed(1),
    totalJobs: profile?.total_completed_jobs ?? 0,
    statusInfo,
    menuGroups: buildMenuGroups(),
    handleLogout,
    logoutConfirmVisible,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
