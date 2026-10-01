import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import { MyJobCard } from "@/features/job/components/MyJobCard";
import { MyPackageCard } from "@/features/job/components/MyPackageCard";
import type { JobsListState } from "@/features/job/hooks/useJobs";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { MyDisplayItem } from "@/features/schedule/utils/myScheduleGrouping";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

type MyJobsListProps = {
  state: JobsListState<MyDisplayItem>;
  onOpen: OpenJob;
  onScrollStart: () => void;
  onEndReached: () => void;
};

export function MyJobsList({
  state,
  onOpen,
  onScrollStart,
  onEndReached,
}: MyJobsListProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: MyDisplayItem; index: number }) =>
      item.type === "package" ? (
        <MyPackageCard
          bookingId={item.bookingId}
          sessions={item.sessions}
          onOpen={onOpen}
          index={index}
        />
      ) : (
        <MyJobCard item={item.item} onOpen={onOpen} index={index} />
      ),
    [onOpen],
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
      keyExtractor={(item) =>
        item.type === "package"
          ? `pkg-${item.bookingId}`
          : `single-${item.item.id}`
      }
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
          ) : (
            <EmptyState
              icon="clipboard"
              title="Bạn chưa nhận buổi nào"
              message="Kéo xuống để làm mới"
            />
          )}
        </View>
      }
    />
  );
}
