import { useGetWorkingAreasQuery } from "@/services/authApi";
import type {
  ProfileStatus,
  WorkerProfileResponse,
} from "@/types/WorkerProfile";
import { getRejectedSteps, stepRoute } from "@/utils/rejectionFlow";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
type Props = {
  profile: WorkerProfileResponse;
};

type StatusRoute = "wizard" | "review" | null;

const STATUS_CONFIG: Record<
  ProfileStatus,
  {
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    ctaLabel: string | null;
    ctaRoute: StatusRoute;
  }
> = {
  DRAFT: {
    title: "Hoàn thiện hồ sơ để bắt đầu nhận việc",
    description:
      "Bạn cần cập nhật ảnh chân dung, CCCD, dịch vụ, khu vực hoạt động và kinh nghiệm.",
    badge: "Chưa hoàn tất",
    badgeColor: "#DC2626",
    ctaLabel: "Cập nhật",
    ctaRoute: "wizard",
  },

  REJECTED: {
    title: "Hồ sơ bị từ chối, vui lòng cập nhật lại",
    description:
      "Vui lòng kiểm tra và chỉnh sửa thông tin theo phản hồi của quản trị viên.",
    badge: "Bị từ chối",
    badgeColor: "#DC2626",
    ctaLabel: "Cập nhật",
    ctaRoute: "wizard",
  },

  PENDING: {
    title: "Hồ sơ đang chờ xét duyệt",
    description: "Quản trị viên sẽ phản hồi trong vòng 24 - 48 giờ.",
    badge: "Chờ duyệt",
    badgeColor: "#D97706",
    ctaLabel: "Xem lại hồ sơ",
    ctaRoute: "review",
  },

  ACTIVE: {
    title: "",
    description: "",
    badge: "",
    badgeColor: "",
    ctaLabel: null,
    ctaRoute: null,
  },

  SUSPENDED: {
    title: "Tài khoản đang bị tạm khóa",
    description: "Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
    badge: "Tạm khóa",
    badgeColor: "#DC2626",
    ctaLabel: null,
    ctaRoute: null,
  },
};

const TOTAL_STEPS = 5;

export function ProfileStatusCard({ profile }: Props) {
  const { status } = profile;

  // Chỉ fetch khu vực khi hồ sơ chưa ACTIVE
  const { data: workingAreas } = useGetWorkingAreasQuery(undefined, {
    skip: status === "ACTIVE",
  });

  if (status === "ACTIVE") {
    return null;
  }

  const config = STATUS_CONFIG[status];

  const stepsDone = [
    // Step 1: Ảnh chân dung
    !!profile.portrait,

    // Step 2: CCCD
    !!profile.identity_number &&
      !!profile.identity_front &&
      !!profile.identity_back,

    // Step 3: Dịch vụ
    !!profile.registered_service,

    // Step 4: Khu vực hoạt động
    !!workingAreas && workingAreas.length > 0,

    // Step 5: Kinh nghiệm
    !!profile.bio &&
      profile.experience_years !== null &&
      profile.experience_years !== undefined &&
      !!profile.certificate_file,
  ].filter(Boolean).length;

  const completionPercent = Math.round((stepsDone / TOTAL_STEPS) * 100);

  const handlePressCta = () => {
    if (config.ctaRoute === "wizard") {
      if (status === "REJECTED") {
        const steps = getRejectedSteps(profile.rejected_fields);
        if (steps.length > 0) {
          router.push(stepRoute(steps[0]));
          return;
        }
      }
      router.push("/(profile-setup)/portrait");
    } else if (config.ctaRoute === "review") {
      router.push("/(profile-setup)/my-profile");
    }
  };

  return (
    <View className="mx-5 mt-5 bg-white rounded-3xl border border-[#E5E7EB] p-5">
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="flex-row items-center px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${config.badgeColor}1A`,
          }}
        >
          <View
            className="w-1.5 h-1.5 rounded-full mr-1.5"
            style={{
              backgroundColor: config.badgeColor,
            }}
          />

          <Text
            className="text-xs font-semibold"
            style={{
              color: config.badgeColor,
            }}
          >
            {config.badge}
          </Text>
        </View>

        <Feather name="alert-circle" size={18} color={config.badgeColor} />
      </View>

      <Text className="text-[#111827] font-bold text-base mb-1">
        {config.title}
      </Text>

      <Text className="text-[#6B7280] text-sm leading-5 mb-4">
        {config.description}
      </Text>

      {status === "REJECTED" && !!profile.rejection_reason && (
        <View className="bg-[#FEF2F2] rounded-xl p-3 mb-4">
          <Text className="text-[#DC2626] text-xs font-semibold mb-1">
            Lý do từ chối
          </Text>

          <Text className="text-[#DC2626] text-sm">
            {profile.rejection_reason}
          </Text>
        </View>
      )}

      {status !== "PENDING" && (
        <>
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[#111827] text-sm">
              Hoàn thành{" "}
              <Text
                className="font-bold"
                style={{
                  color: config.badgeColor,
                }}
              >
                {completionPercent}%
              </Text>
            </Text>

            <Text className="text-[#6B7280] text-sm">
              {stepsDone}/{TOTAL_STEPS}
            </Text>
          </View>

          <View className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden mb-4">
            <View
              className="h-full rounded-full"
              style={{
                width: `${completionPercent}%`,
                backgroundColor: config.badgeColor,
              }}
            />
          </View>
        </>
      )}

      {config.ctaLabel && (
        <TouchableOpacity
          className="rounded-2xl py-3.5 items-center"
          style={{
            backgroundColor:
              config.badgeColor === "#D97706" ? "#2563EB" : "#EF4444",
          }}
          onPress={handlePressCta}
        >
          <Text className="text-white font-semibold text-[15px]">
            {config.ctaLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
