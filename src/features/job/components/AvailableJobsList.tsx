import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";

import { AvailableJobCard } from "@/features/job/components/AvailableJobCard";
import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import { Feather } from "@expo/vector-icons";
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
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const renderItem = useCallback(
    ({ item, index }: { item: WorkerSchedule; index: number }) => (
      <AvailableJobCard
        item={item}
        onOpen={onOpen}
        dayFiltered={dayFiltered}
        index={index}
      />
    ),
    [onOpen, dayFiltered, tr],
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
          <View
            className="flex-row items-center"
            style={{ marginBottom: 12, paddingHorizontal: 2 }}
          >
            <Text className="text-ink font-extrabold text-[17px]">
              {dayFiltered
                ? tr("Việc trống trong ngày")
                : tr("Việc đang chờ nhận")}
            </Text>
            <View
              className="items-center justify-center"
              style={{
                minWidth: 26,
                height: 22,
                paddingHorizontal: 8,
                marginLeft: 8,
                borderRadius: 11,
                backgroundColor: COLORS.primaryLight,
              }}
            >
              <Text
                className="font-extrabold text-[12.5px]"
                style={{ color: COLORS.primaryDark }}
              >
                {state.total}
              </Text>
            </View>
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
