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
        subtitle={data.length ? `${data.length} khiếu nại` : undefined}
        onBack={() => router.back()}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(c) => String(c.id)}
          refreshing={isFetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40 + insets.bottom,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="check-circle"
              title="Chưa có khiếu nại"
              message="Các khiếu nại bạn gửi sẽ hiển thị tại đây."
            />
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => router.push(`/complaints/${item.id}` as any)}
              accessibilityRole="button"
              containerStyle={{ marginBottom: 12 }}
              className="bg-surface border border-line p-4"
              style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
            >
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-full bg-danger-light items-center justify-center mr-3">
                  <Feather
                    name="alert-circle"
                    size={20}
                    color={COLORS.danger}
                  />
                </View>
                <View className="flex-1 pr-2">
                  <Text
                    className="text-ink text-sm font-extrabold"
                    numberOfLines={1}
                  >
                    {item.issue_type_name}
                  </Text>
                  <Text className="text-ink-muted text-xs mt-0.5">
                    #{item.id} · {formatDateTime(item.created_at)}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.ink} />
              </View>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-ink-soft text-xs">
                  {item.stage_label}
                </Text>
                <ComplaintStatusBadge
                  status={item.status}
                  label={item.status_label}
                />
              </View>
            </PressableScale>
          )}
        />
      )}
    </View>
  );
}
