import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { useProfileStatus } from "@/features/profile-setup/hooks/useProfileStatus";
import type {
  ProfileStatus,
  WorkerProfileResponse,
} from "@/features/profile-setup/types/WorkerProfile";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  profile: WorkerProfileResponse;
};

type FeatherName = ComponentProps<typeof Feather>["name"];

const STATUS_ICON: Record<ProfileStatus, FeatherName> = {
  DRAFT: "edit-3",
  REJECTED: "x-circle",
  PENDING: "clock",
  ACTIVE: "check-circle",
  SUSPENDED: "lock",
};

const TONE = {
  danger: {
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  warning: {
    color: COLORS.warning,
    bg: COLORS.warningLight,
    text: COLORS.warningDark,
  },
} as const;

export function ProfileStatusCard({ profile }: Props) {
  const {
    status,
    isActive,
    config,
    stepsDone,
    totalSteps,
    completionPercent,
    handlePressCta,
  } = useProfileStatus(profile);

  if (isActive) return null;

  const tone = TONE[config.tone];
  const isPending = status === "PENDING";

  return (
    <View
      className="mx-5 mt-5 bg-surface border border-line p-5"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: tone.bg }}
        >
          <Feather name={STATUS_ICON[status]} size={22} color={tone.color} />
        </View>

        <View
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: tone.bg }}
        >
          <View
            className="w-1.5 h-1.5 rounded-full mr-1.5"
            style={{ backgroundColor: tone.color }}
          />
          <Text className="text-xs" style={[TYPE.label, { color: tone.text }]}>
            {config.badge}
          </Text>
        </View>
      </View>

      <Text className="text-ink font-extrabold text-lg mb-1">
        {config.title}
      </Text>
      <Text className="text-ink-soft text-sm leading-5 mb-4">
        {config.description}
      </Text>

      {status === "REJECTED" && !!profile.rejection_reason && (
        <View className="bg-danger-light rounded-2xl p-3.5 mb-4">
          <Text className="text-danger text-xs mb-1" style={TYPE.label}>
            Lý do từ chối
          </Text>
          <Text className="text-danger text-sm leading-5">
            {profile.rejection_reason}
          </Text>
        </View>
      )}

      {!isPending && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-ink text-sm">
              Hoàn thành{" "}
              <Text className="font-extrabold" style={{ color: tone.text }}>
                {completionPercent}%
              </Text>
            </Text>
            <Text className="text-ink-soft text-sm">
              {stepsDone}/{totalSteps}
            </Text>
          </View>
          <View className="h-2 bg-accent-light rounded-full overflow-hidden">
            <View
              className="h-full rounded-full bg-ink"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
        </View>
      )}

      {config.ctaLabel && (
        <Pressable
          onPress={handlePressCta}
          className={`flex-row items-center justify-center rounded-full ${
            isPending ? "bg-ink" : "bg-primary"
          }`}
          style={{ height: 48 }}
        >
          <Text className="text-white text-[13px]" style={TYPE.button}>
            {config.ctaLabel.toUpperCase()}
          </Text>
          <Feather
            name="arrow-right"
            size={15}
            color={COLORS.white}
            style={{ marginLeft: 6 }}
          />
        </Pressable>
      )}
    </View>
  );
}
