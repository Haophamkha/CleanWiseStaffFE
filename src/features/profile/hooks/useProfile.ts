import { COLORS } from "@/constants/theme";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/features/notification/api/notificationApi";
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
  items: MenuItem[];
};

export const STATUS_INFO: Record<ProfileStatus, ProfileStatusInfo> = {
  DRAFT: {
    label: "Chưa hoàn tất hồ sơ",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  PENDING: {
    label: "Đang chờ duyệt",
    color: COLORS.warning,
    bg: COLORS.warningLight,
    text: COLORS.warningDark,
  },
  ACTIVE: {
    label: "Đang làm việc",
    color: COLORS.success,
    bg: COLORS.successLight,
    text: COLORS.success,
  },
  REJECTED: {
    label: "Hồ sơ bị từ chối",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  SUSPENDED: {
    label: "Tạm khóa",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
};

function buildMenuGroups(openSettings: () => void): MenuGroup[] {
  return [
    {
      title: "Tài khoản",
      items: [
        {
          icon: "user",
          label: "Thông tin cá nhân",
          onPress: () => router.push("/(profile-setup)/personal-info"),
        },
        {
          icon: "map-pin",
          label: "Khu vực hoạt động",
          onPress: () => router.push("/(profile-setup)/working-areas"),
        },
        {
          icon: "folder",
          label: "Hồ sơ của tôi",
          onPress: () => router.push("/(profile-setup)/my-profile"),
        },
      ],
    },
    {
      title: "Tài chính",
      items: [
        {
          icon: "credit-card",
          label: "Tài khoản ngân hàng",
          onPress: () => router.push("/payment-methods" as any),
        },
        {
          icon: "dollar-sign",
          label: "Thu nhập",
          onPress: () => router.push("/earnings" as any),
        },
      ],
    },
    {
      title: "Khác",
      items: [
        { icon: "settings", label: "Cài đặt", onPress: openSettings },
        {
          icon: "info",
          label: "Về CleanWise",
          onPress: () => router.push("/about" as any),
        },
      ],
    },
  ];
}

export function useProfile() {
  const { data: pref } = useGetNotificationPreferencesQuery();
  const [updatePref, { isLoading: isUpdatingPref }] =
    useUpdateNotificationPreferencesMutation();
  const { data: profile, isLoading, isError } = useGetWorkerProfileQuery();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username
    : "";

  const avatarUri = resolveMediaUrl(profile?.portrait);

  const rating = profile?.average_rating ? Number(profile.average_rating) : 0;

  const statusInfo: ProfileStatusInfo | null = profile
    ? (STATUS_INFO[profile.status] ?? {
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

  const handleTogglePush = (value: boolean) => {
    void updatePref({ push_enabled: value });
  };

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  return {
    isLoading,
    isError,
    fullName: fullName || "Nhân viên",
    phone: profile?.phone_number ?? "",
    avatarUri,
    ratingText: rating.toFixed(1),
    totalJobs: profile?.total_completed_jobs ?? 0,
    statusInfo,
    menuGroups: buildMenuGroups(openSettings),
    settingsOpen,
    closeSettings,
    pushEnabled: pref?.push_enabled ?? true,
    pushDisabled: !pref || isUpdatingPref,
    handleTogglePush,
    handleLogout,
    logoutConfirmVisible,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
