import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";

import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import { MyJobCard } from "@/features/job/components/MyJobCard";
import { MyPackageCard } from "@/features/job/components/MyPackageCard";
import type { JobsListState } from "@/features/job/hooks/useJobs";
import type { OpenJob } from "@/features/job/types/jobNav";
import type { MyJobsTab } from "@/features/schedule/types/Schedule";
import { getHighlightedSession, type MyDisplayItem } from "@/features/schedule/utils/myScheduleGrouping";
import type { GeoPoint } from "@/hooks/useDistanceToAddress";
import { formatDayLabel, toYMD } from "@/utils/format";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

type MyJobsListProps = {
  state: JobsListState<MyDisplayItem>;
  tab: MyJobsTab;
  location: GeoPoint | null;
  onOpen: OpenJob;
  onScrollStart: () => void;
  onEndReached: () => void;
};

function getLocalizedEmpty(translateText = defaultTranslate): Record<MyJobsTab, { title: string; message: string }> {
  return {
    upcoming: {
      title: translateText("Chưa có buổi sắp tới"),
      message: translateText("Vào tab Khả dụng để nhận việc"),
    },
    today: {
      title: translateText("Hôm nay bạn không có buổi nào"),
      message: translateText("Kéo xuống để làm mới"),
    },
    completed: {
      title: translateText("Chưa có buổi nào hoàn thành"),
      message: translateText("Các buổi đã làm xong sẽ hiện ở đây"),
    },
    cancelled: {
      title: translateText("Không có buổi nào bị hủy"),
      message: translateText("Kéo xuống để làm mới"),
    },
  };
}

export function MyJobsList({
  state,
  tab,
  location,
  onOpen,
  onScrollStart,
  onEndReached,
}: MyJobsListProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const dayHeaders = useMemo(() => {
    if (tab !== "upcoming") return [];

    let previousDay: string | undefined;
    return state.items.map((item) => {
      const session = item.type === "package" ? getHighlightedSession(item.sessions) : item.item;
      const day = toYMD(new Date(session.scheduled_start));
      const showHeader = day !== previousDay;
      previousDay = day;
      return showHeader ? formatDayLabel(session.scheduled_start, tr) : null;
    });
  }, [state.items, tab, tr]);

  const renderItem = useCallback(
    ({ item, index }: { item: MyDisplayItem; index: number }) => (
      <View style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}>
        {dayHeaders[index] ? (
          <View className="mx-1.5 mb-2 mt-1 flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
            <Text accessibilityRole="header" className="shrink text-xs font-bold uppercase text-ink-soft">
              {dayHeaders[index]}
            </Text>
            <View className="h-px flex-1 bg-line" />
          </View>
        ) : null}
        {item.type === "package" ? (
          <MyPackageCard
            bookingId={item.bookingId}
            sessions={item.sessions}
            location={location}
            onOpen={onOpen}
            index={index}
          />
        ) : (
          <MyJobCard item={item.item} location={location} onOpen={onOpen} index={index} />
        )}
      </View>
    ),
    [dayHeaders, location, onOpen],
  );

  if (state.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const showInitialError = state.isError && !state.hasItems;

  // Hoàn thành / Đã hủy: bấm "Xem thêm" thay vì tự tải khi cuộn
  const isHistory = tab === "completed" || tab === "cancelled";

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => item.type === "package" ? `pkg-${item.bookingId}` : `single-${item.item.id}`}
      renderItem={renderItem}
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
      onEndReached={isHistory ? undefined : onEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      ListFooterComponent={
        <>
          <JobsListFooter
            isLoadingMore={state.isLoadingMore}
            isError={state.isError}
            hasNext={state.hasNext}
            hasItems={state.hasItems}
            onRetry={() => state.retryMore()}
          />
          {isHistory && state.hasNext && !state.isLoadingMore ? (
            <PressableScale
              onPress={state.loadMore}
              accessibilityRole="button"
              className="items-center justify-center border border-line bg-surface rounded-full"
              style={{ height: 44, marginTop: 4 }}
            >
              <Text className="text-ink-soft text-sm font-bold">{tr("Xem thêm")}</Text>
            </PressableScale>
          ) : null}
        </>
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
          ) : (
            <EmptyState
              icon="clipboard"
              title={getLocalizedEmpty(tr)[tab].title}
              message={getLocalizedEmpty(tr)[tab].message}
            />
          )}
        </View>
      }
    />
  );
}
