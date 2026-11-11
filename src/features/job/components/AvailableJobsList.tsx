import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";

import { AvailableJobCard } from "@/features/job/components/AvailableJobCard";
import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import { Feather } from "@expo/vector-icons";
import type { JobsListState } from "@/features/job/hooks/useJobs";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

type AvailableJobsListProps = {
  state: JobsListState<WorkerSchedule>;
  location: GeoPoint | null;
  dayFiltered: boolean;
  onClearDay: () => void;
  onOpen: OpenJob;
  onScrollStart: () => void;
  onEndReached: () => void;
};

export function AvailableJobsList({
  state,
  location,
  dayFiltered,
  onClearDay,
  onOpen,
  onScrollStart,
  onEndReached,
}: AvailableJobsListProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const renderItem = useCallback(
    ({ item, index }: { item: WorkerSchedule; index: number }) => (
      <AvailableJobCard item={item} location={location} onOpen={onOpen} index={index} />
    ),
    [location, onOpen],
  );

  if (state.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const showInitialError = state.isError && !state.hasItems;

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={state.isRefreshing}
          onRefresh={state.refresh}
          tintColor={COLORS.primary}
        />
      }
      onScrollBeginDrag={onScrollStart}
      onMomentumScrollBegin={onScrollStart}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={
        state.total > 0 ? (
          <Text className="mb-3 text-ink-soft text-xs font-semibold">
            {tr(
              dayFiltered
                ? "{{value0}} đơn có buổi trống trong ngày này"
                : "{{value0}} đơn đang chờ nhận",
              { count: state.total, value0: state.total },
            )}
          </Text>
        ) : null
      }
      ListFooterComponent={
        <JobsListFooter
          isLoadingMore={state.isLoadingMore}
          isError={state.isError}
          hasNext={state.hasNext}
          hasItems={state.hasItems}
          onRetry={() => state.retryMore()}
        />
      }
      ListEmptyComponent={
        <View className="flex-1 justify-center py-10">
          {showInitialError ? (
            <EmptyState
              icon="wifi-off"
              title={tr("Không tải được danh sách")}
              actionLabel={tr("Thử lại")}
              onAction={() => {
                state.retryMore();
              }}
            />
          ) : dayFiltered ? (
            <EmptyState
              icon="calendar"
              title={tr("Không có buổi nào trong ngày này")}
              actionLabel={tr("Xem tất cả các ngày")}
              onAction={onClearDay}
            />
          ) : (
            <EmptyState
              icon="clipboard"
              title={tr("Chưa có buổi làm khả dụng")}
              message={tr("Kéo xuống để làm mới")}
            />
          )}
        </View>
      }
    />
  );
}
