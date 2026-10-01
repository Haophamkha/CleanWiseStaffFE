import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { useProfileStatus } from "@/features/profile-setup/hooks/useProfileStatus";
import type {
  ProfileStatus,
  WorkerProfileResponse,
} from "@/features/profile-setup/types/WorkerProfile";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

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
  const segments = totalSteps > 0 ? Array.from({ length: totalSteps }) : [];

  return (
    <View
      className="mx-5 mt-5 bg-surface border border-line overflow-hidden"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      {/* Dải màu theo trạng thái */}
      <View style={{ height: 4, backgroundColor: tone.color }} />

      <View className="p-5">
        <View className="flex-row items-center justify-between mb-4">
          <View
            className="items-center justify-center"
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: tone.bg,
            }}
          >
            <Feather name={STATUS_ICON[status]} size={24} color={tone.color} />
          </View>

          <View
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: tone.bg }}
          >
            <View
              className="rounded-full mr-1.5"
              style={{ width: 6, height: 6, backgroundColor: tone.color }}
            />
            <Text
              className="text-xs"
              style={[TYPE.label, { color: tone.text }]}
            >
              {config.badge}
            </Text>
          </View>
        </View>

        <Text className="text-ink font-extrabold text-xl mb-1.5">
          {config.title}
        </Text>
        <Text className="text-ink-soft text-sm leading-5">
          {config.description}
        </Text>

        {status === "REJECTED" && !!profile.rejection_reason && (
          <View className="flex-row bg-danger-light rounded-2xl mt-4 overflow-hidden">
            <View style={{ width: 4, backgroundColor: COLORS.danger }} />
            <View className="flex-1 p-3.5">
              <View className="flex-row items-center mb-1">
                <Feather name="alert-circle" size={14} color={COLORS.danger} />
                <Text className="text-danger text-xs ml-1.5" style={TYPE.label}>
                  Lý do từ chối
                </Text>
              </View>
              <Text className="text-danger text-sm leading-5">
                {profile.rejection_reason}
              </Text>
            </View>
          </View>
        )}

        {!isPending && (
          <View className="mt-5">
            <View className="flex-row items-end justify-between mb-2.5">
              <View className="flex-row items-baseline">
                <Text
                  className="text-3xl font-extrabold"
                  style={{ color: COLORS.ink }}
                >
                  {completionPercent}%
                </Text>
                <Text className="text-ink-muted text-sm ml-1.5">
                  hoàn thành
                </Text>
              </View>
              <Text className="text-ink-soft text-sm font-semibold">
                {stepsDone}/{totalSteps} bước
              </Text>
            </View>

            {segments.length > 0 ? (
              <View className="flex-row" style={{ gap: 6 }}>
                {segments.map((_, i) => (
                  <View
                    key={i}
                    className={`flex-1 rounded-full ${
                      i < stepsDone ? "bg-ink" : "bg-accent-light"
                    }`}
                    style={{ height: 6 }}
                  />
                ))}
              </View>
            ) : (
              <View className="h-1.5 bg-accent-light rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${completionPercent}%` }}
                />
              </View>
            )}
          </View>
        )}

        {config.ctaLabel ? (
          <PrimaryButton
            label={config.ctaLabel}
            variant={isPending ? "dark" : "primary"}
            onPress={handlePressCta}
            style={{ marginTop: 20 }}
          />
        ) : null}
      </View>
    </View>
  );
}
