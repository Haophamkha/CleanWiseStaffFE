import type { Paginated } from "@/types/Schedule";
import { useCallback, useState } from "react";

export type PagedQueryHook<T, F> = (arg: F & { page: number }) => {
  currentData?: Paginated<T>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => unknown;
};

export function usePagedJobs<T, F extends object>(
  useQuery: PagedQueryHook<T, F>,
  filters: F,
) {
  const filterKey = JSON.stringify(filters);
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const query = useQuery({ ...filters, page });
  const { currentData: data, isFetching, refetch } = query;

  const items = data?.results ?? [];
  const hasNext = data?.has_next ?? false;

  const loadMore = useCallback(() => {
    if (isFetching || !data?.has_next) return;
    // data.page !== page nghĩa là đã yêu cầu trang kế mà chưa về (hoặc bị
    // lỗi): không tăng page thêm lần nữa.
    if (data.page !== page) return;
    setPageState({ key: filterKey, page: page + 1 });
  }, [isFetching, data, page, filterKey]);

  const refresh = useCallback(() => {
    if (page === 1) refetch();
    else setPageState({ key: filterKey, page: 1 });
  }, [page, refetch, filterKey]);

  const isLoading = query.isLoading || (data === undefined && isFetching);

  return {
    items,
    total: data?.count ?? 0,
    hasNext,
    isLoading,
    isError: query.isError,
    isLoadingMore: isFetching && page > 1,
    isRefreshing: isFetching && page === 1 && !isLoading,
    loadMore,
    refresh,
    retryMore: refetch,
  };
}
