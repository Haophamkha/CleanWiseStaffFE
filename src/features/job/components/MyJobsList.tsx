import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
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

const EMPTY: Record<MyJobsTab, { title: string; message: string }> = {
  upcoming: {
    title: "Chưa có buổi sắp tới",
    message: "Vào tab Khả dụng để nhận việc",
  },
  today: {
    title: "Hôm nay bạn không có buổi nào",
    message: "Kéo xuống để làm mới",
  },
  completed: {
    title: "Chưa có buổi nào hoàn thành",
    message: "Các buổi đã làm xong sẽ hiện ở đây",
  },
  cancelled: {
    title: "Không có buổi nào bị hủy",
    message: "Kéo xuống để làm mới",
  },
};

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
        label: running ? "Đang thực hiện" : rel ? `${rel} · ${day}` : day,
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
  return (
    <View className="flex-row items-center mt-2 mb-3">
      <View
        className="rounded-full mr-2"
        style={{
          width: 8,
          height: 8,
          backgroundColor: running ? COLORS.primary : COLORS.inkMuted,
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
  const rows = useMemo(() => buildRows(state.items), [state.items]);

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
              title={EMPTY[tab].title}
              message={EMPTY[tab].message}
            />
          )}
        </View>
      }
    />
  );
}
