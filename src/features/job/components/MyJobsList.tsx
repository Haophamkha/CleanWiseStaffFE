import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableScale } from "@/components/ui/PressableScale";

import { JobsListFooter } from "@/features/job/components/JobsListFooter";
import { MyJobCard } from "@/features/job/components/MyJobCard";
import { MyPackageCard } from "@/features/job/components/MyPackageCard";
import type { JobsListState } from "@/features/job/hooks/useJobs";
import type { OpenJob } from "@/features/job/types/jobNav";
import type {
  MyJobsTab,
  WorkerMySchedule,
} from "@/features/schedule/types/Schedule";
import type { MyDisplayItem } from "@/features/schedule/utils/myScheduleGrouping";
import { formatDayLabel, relativeDayLabel, toYMD } from "@/utils/format";
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
  onOpen: OpenJob;
  onScrollStart: () => void;
  onEndReached: () => void;
};

type Row =
  | { kind: "header"; key: string; label: string; running: boolean }
  | { kind: "item"; key: string; item: MyDisplayItem };

function getLocalizedEmpty(): Record<MyJobsTab, { title: string; message: string }> {
  return {
    upcoming: {
      title: tr("Chưa có buổi sắp tới"),
      message: tr("Vào tab Khả dụng để nhận việc"),
    },
    today: {
      title: tr("Hôm nay bạn không có buổi nào"),
      message: tr("Kéo xuống để làm mới"),
    },
    completed: {
      title: tr("Chưa có buổi nào hoàn thành"),
      message: tr("Các buổi đã làm xong sẽ hiện ở đây"),
    },
    cancelled: {
      title: tr("Không có buổi nào bị hủy"),
      message: tr("Kéo xuống để làm mới"),
    },
  };
}

/** Buổi đại diện của 1 thẻ: đang làm > buổi chờ gần nhất > buổi đầu. */
function anchorOf(item: MyDisplayItem): WorkerMySchedule {
  if (item.type !== "package") return item.item;
  const s = item.sessions;
  const running = s.find((x) => x.status === "IN_PROGRESS");
  if (running) return running;
  const pending = s
    .filter((x) => x.status === "PENDING")
    .sort(
      (a, b) =>
        new Date(a.scheduled_start).getTime() -
        new Date(b.scheduled_start).getTime(),
    );
  return pending[0] ?? s[0];
}

function buildRows(items: MyDisplayItem[]): Row[] {
  const rows: Row[] = [];
  let lastKey = "";

  for (const it of items) {
    const a = anchorOf(it);
    const running = a.status === "IN_PROGRESS";
    const key = running ? "running" : toYMD(new Date(a.scheduled_start));

    if (key !== lastKey) {
      lastKey = key;
      const rel = relativeDayLabel(a.scheduled_start);
      const day = formatDayLabel(a.scheduled_start);
      rows.push({
        kind: "header",
        key: `h-${rows.length}`,
        label: running ? tr("Đang thực hiện") : rel ? `${rel} · ${day}` : day,
        running,
      });
    }

    rows.push({
      kind: "item",
      key:
        it.type === "package" ? `pkg-${it.bookingId}` : `single-${it.item.id}`,
      item: it,
    });
  }
  return rows;
}

function DayHeader({ label, running }: { label: string; running: boolean }) {
  const { COLORS } = useAppTheme();

  return (
    <View className="flex-row items-center mt-2 mb-3">
      <View
        className="rounded-full mr-2"
        style={{
          width: 8,
          height: 8,
          backgroundColor: running ? COLORS.primaryFill : COLORS.inkMuted,
        }}
      />
      <Text
        className={`text-xs font-bold uppercase ${
          running ? "text-primary" : "text-ink-soft"
        }`}
        style={{ letterSpacing: 0.6 }}
      >
        {label}
      </Text>
      <View className="flex-1 h-[1px] bg-line ml-3" />
    </View>
  );
}

export function MyJobsList({
  state,
  tab,
  onOpen,
  onScrollStart,
  onEndReached,
}: MyJobsListProps) {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const rows = useMemo(() => buildRows(state.items), [state.items, tr]);

  const renderItem = useCallback(
    ({ item: row, index }: { item: Row; index: number }) => {
      if (row.kind === "header") {
        return <DayHeader label={row.label} running={row.running} />;
      }
      const item = row.item;
      return item.type === "package" ? (
        <MyPackageCard
          bookingId={item.bookingId}
          sessions={item.sessions}
          onOpen={onOpen}
          index={index}
        />
      ) : (
        <MyJobCard item={item.item} onOpen={onOpen} index={index} />
      );
    },
    [onOpen, tr],
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
      data={rows}
      keyExtractor={(row) => row.key}
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
              title={getLocalizedEmpty()[tab].title}
              message={getLocalizedEmpty()[tab].message}
            />
          )}
        </View>
      }
    />
  );
}
