import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { DetailHeader } from "@/components/common/DetailHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";
import { RADIUS } from "@/constants/theme";
import { useGetMyComplaintsQuery } from "@/features/complaint/api/complaintApi";
import { ComplaintCard } from "@/features/complaint/components/ComplaintCard";
import { ComplaintTabs, type ComplaintTab } from "@/features/complaint/components/ComplaintTabs";
import { DisciplinePanel } from "@/features/complaint/components/DisciplinePanel";
import { WorkerStatementPanel } from "@/features/complaint/components/WorkerStatementPanel";
import { formatDateTime } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { goBackOrReplace } from "@/utils/navigation";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ComplaintListScreen() {
  const { t: tr } = useTranslation();

  const { COLORS, SHADOWS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: ComplaintTab }>();
  const [tab, setTab] = useState<ComplaintTab>(initialTab === "discipline" || initialTab === "statements" ? initialTab : "complaints");

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetMyComplaintsQuery();

  return (
    <View className="flex-1 bg-canvas">
      <DetailHeader
        title={tr("Khiếu nại của tôi")}
        subtitle={
          data.length > 0
            ? tr("{{value0}} khiếu nại", { value0: data.length , count: data.length})
            : tr("Theo dõi các khiếu nại của bạn")
        }
        onBack={() => goBackOrReplace("/(tabs)/profile")}
      />

      <ComplaintTabs value={tab} onChange={setTab} />
      {tab === "statements" ? <WorkerStatementPanel /> : tab === "discipline" ? <DisciplinePanel /> : isLoading ? (
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
                title={tr("Chưa có khiếu nại")}
                message={tr("Các khiếu nại bạn gửi sẽ hiển thị tại đây.")}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ComplaintCard item={item} onPress={() => router.push(`/complaints/${item.id}` as any)} />
          )}
        />
      )}
    </View>
  );
}
