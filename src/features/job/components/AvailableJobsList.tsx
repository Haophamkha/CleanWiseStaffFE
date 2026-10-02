import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { AvailableJobCard } from "@/features/job/components/AvailableJobCard";
import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import type { JobsListState } from "@/features/job/hooks/useJobs";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { WorkerSchedule } from "@/features/schedule/types/Schedule";
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
  dayFiltered: boolean;
  onClearDay: () => void;
  onOpen: OpenJob;
  onScrollStart: () => void;
  onEndReached: () => void;
};

export function AvailableJobsList({
  state,
  dayFiltered,
  onClearDay,
  onOpen,
  onScrollStart,
  onEndReached,
}: AvailableJobsListProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: WorkerSchedule; index: number }) => (
      <AvailableJobCard
        item={item}
        onOpen={onOpen}
        dayFiltered={dayFiltered}
        index={index}
      />
    ),
    [onOpen, dayFiltered],
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
      contentContainerStyle={{ padding: 20, paddingBottom: 24, flexGrow: 1 }}
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
          <View className="self-start bg-accent-light rounded-full px-3 py-1.5 mb-3">
            <Text className="text-ink-soft text-xs font-semibold">
              {dayFiltered
                ? `${state.total} đơn có buổi trống trong ngày này`
                : `${state.total} đơn đang chờ nhận`}
            </Text>
          </View>
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
              title="Không tải được danh sách"
              actionLabel="Thử lại"
              onAction={() => {
                state.retryMore();
              }}
            />
          ) : dayFiltered ? (
            <EmptyState
              icon="calendar"
              title="Không có buổi nào trong ngày này"
              actionLabel="Xem tất cả các ngày"
              onAction={onClearDay}
            />
          ) : (
            <EmptyState
              icon="clipboard"
              title="Chưa có buổi làm khả dụng"
              message="Kéo xuống để làm mới"
            />
          )}
        </View>
      }
    />
  );
}
