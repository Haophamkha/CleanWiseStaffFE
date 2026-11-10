import { translate as defaultTranslate } from "@/features/language/i18n";
import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

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

export function getProfileStatusInfo(
  COLORS: ThemeColors, translateText = defaultTranslate,
): Record<ProfileStatus, ProfileStatusInfo> {
  return {
    DRAFT: {
      label: translateText("Chưa hoàn tất hồ sơ"),
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      text: COLORS.danger,
    },
    PENDING: {
      label: translateText("Đang chờ duyệt"),
      color: COLORS.warning,
      bg: COLORS.warningLight,
      text: COLORS.warningDark,
    },
    ACTIVE: {
      label: translateText("Đang làm việc"),
      color: COLORS.success,
      bg: COLORS.successLight,
      text: COLORS.success,
    },
    REJECTED: {
      label: translateText("Hồ sơ bị từ chối"),
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      text: COLORS.danger,
    },
    SUSPENDED: {
      label: translateText("Tạm khóa"),
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      text: COLORS.danger,
    },
  };
}

function buildMenuGroups(translateText = defaultTranslate): MenuGroup[] {
  return [
    {
      title: translateText("Tài khoản"),
      layout: "list",
      items: [
        {
          icon: "user",
          label: translateText("Thông tin cá nhân"),
          onPress: () => router.push("/(profile-setup)/personal-info"),
        },
        {
          icon: "map-pin",
          label: translateText("Khu vực hoạt động"),
          onPress: () => router.push("/(profile-setup)/working-areas"),
        },
        {
          icon: "folder",
          label: translateText("Hồ sơ của tôi"),
          onPress: () => router.push("/(profile-setup)/my-profile"),
        },
        {
          icon: "credit-card",
          label: translateText("Tài khoản ngân hàng"),
          onPress: () => router.push("/payment-methods" as any),
        },
        {
          icon: "trending-up",
          label: translateText("Ví"),
          onPress: () => router.push("/earnings" as any),
        },
        {
          icon: "alert-circle",
          label: translateText("Khiếu nại của tôi"),
          onPress: () => router.push("/complaints" as any),
        },
      ],
    },
    {
      title: translateText("Ứng dụng"),
      layout: "support",
      items: [
        {
          icon: "settings",
          label: translateText("Cài đặt"),
          onPress: () => router.push("/settings" as any),
        },
        {
          icon: "info",
          label: translateText("Về CleanWise"),
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
    ? (getProfileStatusInfo(COLORS, tr)[profile.status] ?? {
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
    menuGroups: buildMenuGroups(tr),
    handleLogout,
    logoutConfirmVisible,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
