import { SimpleHeader } from "@/components/profile-setup/SimpleHeader";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import type { ProfileStatus } from "@/types/WorkerProfile";
import { resolveMediaUrl } from "@/utils/media";
import { getRejectedSteps, stepRoute } from "@/utils/rejectionFlow";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const STATUS_LABEL: Record<ProfileStatus, { label: string; color: string }> = {
  DRAFT: { label: "Chưa hoàn tất hồ sơ", color: "#DC2626" },
  PENDING: { label: "Đang chờ duyệt", color: "#D97706" },
  ACTIVE: { label: "Đang làm việc", color: "#22C55E" },
  REJECTED: { label: "Hồ sơ bị từ chối", color: "#DC2626" },
  SUSPENDED: { label: "Tạm khóa", color: "#DC2626" },
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

// Nhãn hiển thị tiếng Việt cho từng key field mà admin có thể đánh dấu
// là "cần sửa". Phải khớp với REJECTABLE_PROFILE_FIELDS ở backend.
const REJECTED_FIELD_LABEL: Record<string, string> = {
  first_name: "Tên",
  last_name: "Họ và tên đệm",
  phone_number: "Số điện thoại",
  gender: "Giới tính",
  birth_date: "Ngày sinh",
  bio: "Giới thiệu",
  experience_years: "Số năm kinh nghiệm",
  identity_number: "Số CCCD/CMND",
  service_id: "Dịch vụ đăng ký",
  portrait: "Ảnh chân dung",
  identity_front: "Ảnh CCCD/CMND mặt trước",
  identity_back: "Ảnh CCCD/CMND mặt sau",
  certificate_file: "Chứng chỉ",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-[#F3F4F6]">
      <Text className="text-[#6B7280] text-sm">{label}</Text>
      <Text className="text-[#111827] text-sm font-medium flex-1 text-right ml-3">
        {value || "—"}
      </Text>
    </View>
  );
}

export default function MyProfileScreen() {
  const { data: profile, isLoading } = useGetWorkerProfileQuery();

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-[#F8F9FC]">
        <SimpleHeader title="Hồ sơ của tôi" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" />
        </View>
      </View>
    );
  }

  const statusInfo = STATUS_LABEL[profile.status] ?? {
    label: profile.status,
    color: "#6B7280",
  };
  const portraitUri = resolveMediaUrl(profile.portrait);
  const identityFrontUri = resolveMediaUrl(profile.identity_front);
  const identityBackUri = resolveMediaUrl(profile.identity_back);
  const certificateUri = resolveMediaUrl(profile.certificate_file);

  const rejectedFieldEntries = Object.entries(profile.rejected_fields ?? {});
  const isFieldRejected = (field: string) =>
    profile.status === "REJECTED" && field in (profile.rejected_fields ?? {});

  const getUpdateRoute = () => {
    if (profile.status === "REJECTED") {
      const steps = getRejectedSteps(profile.rejected_fields);
      if (steps.length > 0) return stepRoute(steps[0]);
    }
    return "/(profile-setup)/portrait";
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <SimpleHeader title="Hồ sơ của tôi" />
      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Trạng thái + % hoàn thiện */}
        <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${statusInfo.color}1A` }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: statusInfo.color }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Text>
            </View>
            <Text className="text-[#6B7280] text-xs">
              {profile.completion_percent}% hoàn thiện
            </Text>
          </View>

          <View className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden mb-1">
            <View
              className="h-full bg-[#2563EB] rounded-full"
              style={{ width: `${profile.completion_percent}%` }}
            />
          </View>

          {profile.status === "REJECTED" && !!profile.rejection_reason && (
            <View className="mt-3 bg-[#FEF2F2] rounded-xl p-3">
              <Text className="text-[#DC2626] text-xs font-semibold mb-1">
                Lý do từ chối
              </Text>
              <Text className="text-[#DC2626] text-sm mb-2">
                {profile.rejection_reason}
              </Text>

              {rejectedFieldEntries.length > 0 && (
                <View className="mt-1">
                  <Text className="text-[#DC2626] text-xs font-semibold mb-1.5">
                    Các mục cần sửa lại
                  </Text>
                  {rejectedFieldEntries.map(([field, note]) => (
                    <View key={field} className="flex-row mb-1.5">
                      <Feather
                        name="alert-circle"
                        size={14}
                        color="#DC2626"
                        style={{ marginTop: 1, marginRight: 6 }}
                      />
                      <Text className="text-[#DC2626] text-sm flex-1">
                        <Text className="font-semibold">
                          {REJECTED_FIELD_LABEL[field] ?? field}:{" "}
                        </Text>
                        {note}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {!profile.is_complete && profile.missing_fields.length > 0 && (
            <View className="mt-3 bg-[#FFFBEB] rounded-xl p-3">
              <Text className="text-[#D97706] text-xs font-semibold mb-1">
                Thông tin còn thiếu
              </Text>
              {profile.missing_fields.map((field) => (
                <Text key={field} className="text-[#D97706] text-sm">
                  • {field}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Ảnh chân dung */}
        <View className="items-center mb-4">
          <View
            className="w-24 h-24 rounded-full overflow-hidden bg-[#E5E7EB] items-center justify-center border-4"
            style={{
              borderColor: isFieldRejected("portrait") ? "#DC2626" : "#FFFFFF",
            }}
          >
            {portraitUri ? (
              <Image
                source={{ uri: portraitUri }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Feather name="user" size={32} color="#9CA3AF" />
            )}
          </View>
          {isFieldRejected("portrait") && (
            <Text className="text-[#DC2626] text-xs mt-1.5">
              {profile.rejected_fields.portrait}
            </Text>
          )}
        </View>

        {/* Thông tin cá nhân */}
        <View className="bg-white rounded-2xl border border-[#E5E7EB] px-4 mb-4">
          <InfoRow
            label="Họ tên"
            value={`${profile.last_name} ${profile.first_name}`.trim()}
          />
          <InfoRow label="Số điện thoại" value={profile.phone_number} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow
            label="Giới tính"
            value={GENDER_LABEL[profile.gender] ?? profile.gender}
          />
          <InfoRow label="Ngày sinh" value={profile.birth_date} />
          <InfoRow
            label="Kinh nghiệm"
            value={`${profile.experience_years} năm`}
          />
        </View>

        {!!profile.bio && (
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
            <Text className="text-[#6B7280] text-xs font-semibold mb-1">
              Giới thiệu
            </Text>
            <Text className="text-[#111827] text-sm leading-5">
              {profile.bio}
            </Text>
          </View>
        )}

        {/* CCCD */}
        <View className="bg-white rounded-2xl border border-[#E5E7EB] px-4 mb-4">
          <InfoRow label="Số CCCD/CMND" value={profile.identity_number} />
        </View>

        {/* Dịch vụ đã đăng ký */}
        <View className="bg-white rounded-2xl border border-[#E5E7EB] px-4 mb-4">
          <InfoRow
            label="Dịch vụ đăng ký"
            value={profile.registered_service?.name ?? "Chưa chọn"}
          />
        </View>

        {(identityFrontUri || identityBackUri) && (
          <View className="flex-row gap-3 mb-4">
            {identityFrontUri && (
              <View className="flex-1">
                <Text className="text-[#6B7280] text-xs mb-1.5">Mặt trước</Text>
                <Image
                  source={{ uri: identityFrontUri }}
                  className="w-full rounded-xl"
                  style={{
                    aspectRatio: 1.6,
                    borderWidth: isFieldRejected("identity_front") ? 2 : 0,
                    borderColor: "#DC2626",
                  }}
                  resizeMode="cover"
                />
                {isFieldRejected("identity_front") && (
                  <Text className="text-[#DC2626] text-xs mt-1">
                    {profile.rejected_fields.identity_front}
                  </Text>
                )}
              </View>
            )}
            {identityBackUri && (
              <View className="flex-1">
                <Text className="text-[#6B7280] text-xs mb-1.5">Mặt sau</Text>
                <Image
                  source={{ uri: identityBackUri }}
                  className="w-full rounded-xl"
                  style={{
                    aspectRatio: 1.6,
                    borderWidth: isFieldRejected("identity_back") ? 2 : 0,
                    borderColor: "#DC2626",
                  }}
                  resizeMode="cover"
                />
                {isFieldRejected("identity_back") && (
                  <Text className="text-[#DC2626] text-xs mt-1">
                    {profile.rejected_fields.identity_back}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {certificateUri && (
          <View className="mb-4">
            <Text className="text-[#6B7280] text-xs mb-1.5">
              Chứng chỉ / bằng cấp
            </Text>
            <Image
              source={{ uri: certificateUri }}
              className="w-full rounded-xl"
              style={{
                aspectRatio: 1.6,
                borderWidth: isFieldRejected("certificate_file") ? 2 : 0,
                borderColor: "#DC2626",
              }}
              resizeMode="cover"
            />
            {isFieldRejected("certificate_file") && (
              <Text className="text-[#DC2626] text-xs mt-1">
                {profile.rejected_fields.certificate_file}
              </Text>
            )}
          </View>
        )}

        {profile.status === "ACTIVE" && profile.approved_by && (
          <View className="bg-white rounded-2xl border border-[#E5E7EB] px-4 mb-4">
            <InfoRow
              label="Được duyệt bởi"
              value={`${profile.approved_by.last_name} ${profile.approved_by.first_name}`.trim()}
            />
            <InfoRow label="Ngày duyệt" value={profile.approved_at ?? "—"} />
          </View>
        )}

        {(profile.status === "DRAFT" || profile.status === "REJECTED") && (
          <TouchableOpacity
            className="bg-[#2563EB] rounded-2xl py-4 items-center mt-2"
            onPress={() => router.push(getUpdateRoute())}
          >
            <Text className="text-white font-semibold text-[15px]">
              Cập nhật hồ sơ
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
