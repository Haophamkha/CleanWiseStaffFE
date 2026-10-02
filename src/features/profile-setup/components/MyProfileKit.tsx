import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type {
    InfoRowData,
    MyProfileView,
    ProfileImage,
} from "@/features/profile-setup/hooks/useMyProfile";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Image, Text, View } from "react-native";

const AVATAR = 96;

/** Thẻ đầu trang: ảnh chân dung + trạng thái + % hoàn thiện + lý do từ chối / thông tin thiếu */
export function ProfileStatusPanel({
  view,
}: {
  view: Pick<
    MyProfileView,
    "portrait" | "statusInfo" | "completionPercent" | "rejection" | "missing"
  >;
}) {
  const { portrait, statusInfo, completionPercent, rejection, missing } = view;

  return (
    <View
      className="bg-surface border border-line p-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center">
        <View
          className="bg-accent-light items-center justify-center overflow-hidden"
          style={{
            width: AVATAR,
            height: AVATAR,
            borderRadius: 28,
            borderWidth: 4,
            borderColor: portrait.rejected ? COLORS.danger : COLORS.surface,
          }}
        >
          {portrait.uri ? (
            <Image
              source={{ uri: portrait.uri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Feather name="user" size={40} color={COLORS.accentDark} />
          )}
        </View>

        <View className="flex-1 ml-4">
          <View
            className="flex-row items-center self-start px-2.5 py-1 rounded-full"
            style={{ backgroundColor: statusInfo.bg }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: statusInfo.color }}
            />
            <Text
              className="text-[11px]"
              style={[TYPE.label, { color: statusInfo.text }]}
            >
              {statusInfo.label}
            </Text>
          </View>

          <Text className="text-ink-soft text-xs mt-3 mb-1.5">
            <Text className="text-ink text-sm font-extrabold">
              {completionPercent}%
            </Text>{" "}
            hoàn thiện
          </Text>
          <View className="h-2 bg-accent-light rounded-full overflow-hidden">
            <View
              className="h-full bg-ink rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
        </View>
      </View>

      {portrait.rejected && !!portrait.note && (
        <View className="flex-row items-start mt-3">
          <Feather
            name="alert-circle"
            size={13}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-danger text-xs leading-4 ml-1.5">
            {portrait.note}
          </Text>
        </View>
      )}

      {rejection && (
        <View className="mt-4 bg-danger-light rounded-2xl p-3.5">
          <Text className="text-danger text-xs mb-1" style={TYPE.label}>
            {rejection.label}
          </Text>
          <Text className="text-danger text-sm leading-5">
            {rejection.reason}
          </Text>

          {rejection.fields.length > 0 && (
            <View className="mt-3">
              <Text className="text-danger text-xs mb-2" style={TYPE.label}>
                Các mục cần sửa lại
              </Text>
              {rejection.fields.map((f) => (
                <View key={f.key} className="flex-row items-start mb-1.5">
                  <Feather
                    name="alert-circle"
                    size={14}
                    color={COLORS.danger}
                    style={{ marginTop: 2, marginRight: 6 }}
                  />
                  <Text className="flex-1 text-danger text-sm leading-5">
                    <Text style={TYPE.label}>{f.label}: </Text>
                    {f.note}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {missing.length > 0 && (
        <View className="mt-4 bg-warning-light rounded-2xl p-3.5">
          <Text className="text-warning-dark text-xs mb-1" style={TYPE.label}>
            Thông tin còn thiếu
          </Text>
          {missing.map((label) => (
            <Text key={label} className="text-warning-dark text-sm leading-5">
              • {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/** Nhóm có tiêu đề in hoa + thẻ trắng */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text
        className="text-ink-muted text-xs mb-2.5 ml-1"
        style={[TYPE.label, { letterSpacing: 1 }]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        className="bg-surface border border-line px-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        {children}
      </View>
    </View>
  );
}

export function InfoRows({ rows }: { rows: InfoRowData[] }) {
  return (
    <>
      {rows.map((row, i) => (
        <View
          key={row.label}
          className={`flex-row justify-between py-3.5 ${
            i === rows.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <Text className="text-ink-soft text-sm">{row.label}</Text>
          <Text
            className="text-ink text-sm flex-1 text-right ml-3"
            style={TYPE.label}
          >
            {row.value || "—"}
          </Text>
        </View>
      ))}
    </>
  );
}

function ProfileImageTile({
  label,
  image,
}: {
  label: string;
  image: ProfileImage;
}) {
  return (
    <View>
      <Text className="text-ink-soft text-xs mb-1.5" style={TYPE.label}>
        {label}
      </Text>
      <Image
        source={{ uri: image.uri }}
        className="w-full"
        style={{
          aspectRatio: 1.6,
          borderRadius: 16,
          borderWidth: image.rejected ? 2 : 1,
          borderColor: image.rejected ? COLORS.danger : COLORS.line,
        }}
        resizeMode="cover"
      />
      {image.rejected && !!image.note && (
        <View className="flex-row items-start mt-1.5">
          <Feather
            name="alert-circle"
            size={13}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-danger text-xs leading-4 ml-1.5">
            {image.note}
          </Text>
        </View>
      )}
    </View>
  );
}

/** Ảnh CCCD (trước/sau) và chứng chỉ, nằm cuối thẻ "Giấy tờ" */
export function DocumentImages({
  front,
  back,
  certificate,
}: {
  front: ProfileImage | null;
  back: ProfileImage | null;
  certificate: ProfileImage | null;
}) {
  return (
    <>
      {(front || back) && (
        <View className="flex-row pt-1 pb-4" style={{ gap: 12 }}>
          {front && (
            <View className="flex-1">
              <ProfileImageTile label="Mặt trước" image={front} />
            </View>
          )}
          {back && (
            <View className="flex-1">
              <ProfileImageTile label="Mặt sau" image={back} />
            </View>
          )}
        </View>
      )}
      {certificate && (
        <View className="pt-1 pb-4">
          <ProfileImageTile label="Chứng chỉ / bằng cấp" image={certificate} />
        </View>
      )}
    </>
  );
}
