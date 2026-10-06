import { DetailHeader } from "@/components/common/DetailHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { useGetMyComplaintsQuery } from "@/features/complaint/api/complaintApi";
import { ComplaintStatusBadge } from "@/features/complaint/components/ComplaintStatusBadge";
import { formatDateTime } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ComplaintListScreen() {
  const insets = useSafeAreaInsets();

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetMyComplaintsQuery();

  return (
    <View className="flex-1 bg-canvas">
      <DetailHeader
        title="Khiếu nại của tôi"
        subtitle={
          data.length > 0
            ? `${data.length} khiếu nại`
            : "Theo dõi các khiếu nại của bạn"
        }
        onBack={() => router.back()}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          refreshing={isFetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 32 + insets.bottom,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <EmptyState
                icon="check-circle"
                title="Chưa có khiếu nại"
                message="Các khiếu nại bạn gửi sẽ hiển thị tại đây."
              />
            </View>
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => router.push(`/complaints/${item.id}` as any)}
              accessibilityRole="button"
              containerStyle={{ marginBottom: 12 }}
              className="bg-surface border border-line px-4 py-4"
              style={[
                {
                  borderRadius: RADIUS.card,
                },
                SHADOWS.card,
              ]}
            >
              {/* Header */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center pr-3">
                  <View className="w-10 h-10 rounded-xl bg-danger-light items-center justify-center mr-3">
                    <Feather
                      name="alert-circle"
                      size={19}
                      color={COLORS.danger}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-ink-muted text-[11px] font-semibold mb-0.5">
                      MÃ ĐƠN
                    </Text>

                    <Text
                      className="text-ink text-sm font-extrabold"
                      numberOfLines={1}
                    >
                      {item.booking_code}
                    </Text>
                  </View>
                </View>

                <ComplaintStatusBadge
                  status={item.status}
                  label={item.status_label}
                />
              </View>

              {/* Divider */}
              <View className="h-px bg-line my-3.5" />

              {/* Complaint type */}
              <View>
                <Text className="text-ink-muted text-[11px] font-semibold uppercase tracking-wide mb-1">
                  Nội dung khiếu nại
                </Text>

                <Text
                  className="text-ink text-[15px] font-extrabold leading-5"
                  numberOfLines={2}
                >
                  {item.issue_type_name}
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-7 h-7 rounded-lg bg-surface-soft items-center justify-center mr-2">
                    <Feather name="layers" size={13} color={COLORS.inkMuted} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-ink-soft text-[11px]">Giai đoạn</Text>

                    <Text
                      className="text-ink-muted text-xs font-semibold"
                      numberOfLines={1}
                    >
                      {item.stage_label}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center ml-3">
                  <Feather name="clock" size={13} color={COLORS.inkMuted} />

                  <Text className="text-ink-muted text-[11px] ml-1">
                    {formatDateTime(item.created_at)}
                  </Text>
                </View>
              </View>

              {/* Detail hint */}
              <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-line">
                <Text className="text-primary text-xs font-bold mr-1">
                  Xem chi tiết
                </Text>

                <Feather name="arrow-right" size={14} color={COLORS.primary} />
              </View>
            </PressableScale>
          )}
        />
      )}
    </View>
  );
}
