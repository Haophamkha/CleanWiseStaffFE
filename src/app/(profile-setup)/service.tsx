import { COLORS } from "@/constants/theme";
import {
  Choice,
  SearchBox,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Image, Text, View } from "react-native";

export default function ServiceStep() {
  const s = useProfileSetup();

  return (
    <SetupScreen
      setup={s}
      step="service"
      title="Loại dịch vụ"
      subtitle="Chọn loại dịch vụ bạn muốn đăng ký thực hiện."
      disabled={!s.serviceId}
      top={
        <SearchBox
          value={s.serviceSearch}
          onChangeText={s.setServiceSearch}
          placeholder="Tìm dịch vụ..."
        />
      }
    >
      {s.isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {s.serviceGroups.map((group) => (
            <Choice
              key={group.sectionCode}
              selected={group.memberIds.includes(s.serviceId ?? -1)}
              onPress={() => s.selectService(group.representativeId)}
              title={group.name}
              subtitle={group.description || undefined}
              left={
                <View className="w-12 h-12 rounded-xl bg-accent-light overflow-hidden mr-3 items-center justify-center">
                  {group.image ? (
                    <Image
                      source={{ uri: group.image }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Feather
                      name="briefcase"
                      size={18}
                      color={COLORS.accentDark}
                    />
                  )}
                </View>
              }
            />
          ))}
          {s.serviceGroups.length === 0 ? (
            <Text className="text-ink-muted text-center text-sm mt-6">
              Không tìm thấy dịch vụ phù hợp.
            </Text>
          ) : null}
        </View>
      )}
    </SetupScreen>
  );
}
