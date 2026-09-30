import {
    chatApi,
    useGetConversationsQuery,
    useReadChatMessagesMutation,
} from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import type {
    ChatConversation,
    ConversationPage,
} from "@/features/chat/types/chat";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

export type ChatInboxRow = {
  id: number;
  name: string;
  avatar: string | null;
  bookingCode: string | null;
  preview: string;
  timeLabel: string;
  unread: boolean;
  unreadLabel: string;
};

function formatListTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (date.toDateString() === new Date().toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function toRow(item: ChatConversation): ChatInboxRow {
  return {
    id: item.id,
    name: item.other_user.name,
    avatar: item.other_user.avatar,
    bookingCode: item.latest_assignment?.booking_code ?? null,
    preview: item.last_message || "Bắt đầu trò chuyện",
    timeLabel: formatListTime(item.last_message_at),
    unread: item.unread_count > 0,
    unreadLabel: item.unread_count > 99 ? "99+" : String(item.unread_count),
  };
}

export function useChatInbox() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [markRead] = useReadChatMessagesMutation();
  const readingRef = useRef(new Set<number>());
  const { data, isLoading, isFetching, isError, refetch } =
    useGetConversationsQuery(page, {
      skip: !user,
      refetchOnMountOrArgChange: 15,
    });

  useEffect(() => {
    if (!data) return;
    setItems((previous) => {
      if (page === 1) return data.results;
      const byId = new Map(previous.map((item) => [item.id, item]));
      data.results.forEach((item) => byId.set(item.id, item));
      return [...byId.values()];
    });
  }, [data, page]);

  useChatSocket(
    !!user,
    (event) => {
      if (event.type === "message.created" || event.type === "messages.read") {
        setPage(1);
        refetch();
      }
    },
    refetch,
  );

  const refresh = async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const readOnOpen = (item: ChatConversation) => {
    if (item.unread_count <= 0 || readingRef.current.has(item.id)) return;
    readingRef.current.add(item.id);
    setItems((previous) =>
      previous.map((conversation) =>
        conversation.id === item.id
          ? { ...conversation, unread_count: 0 }
          : conversation,
      ),
    );
    const updateUnread = (draft: ConversationPage) => {
      draft.total_unread = Math.max(0, draft.total_unread - item.unread_count);
      const conversation = draft.results.find((row) => row.id === item.id);
      if (conversation) conversation.unread_count = 0;
    };
    dispatch(chatApi.util.updateQueryData("getConversations", 1, updateUnread));
    if (page !== 1) {
      dispatch(
        chatApi.util.updateQueryData("getConversations", page, updateUnread),
      );
    }
    void markRead({ conversation_id: item.id })
      .unwrap()
      .catch(() => {
        void refetch();
      })
      .finally(() => {
        readingRef.current.delete(item.id);
      });
  };

  const openConversation = (id: number) => {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    readOnOpen(item);
    router.push({
      pathname: "/messages/[id]",
      params: { id: String(id) },
    });
  };

  const loadMore = () => {
    if (data?.next && !isFetching) setPage((value) => value + 1);
  };

  const rows = useMemo(() => items.map(toRow), [items]);
  const status: "guest" | "loading" | "error" | "ready" = !user
    ? "guest"
    : isLoading && !data
      ? "loading"
      : isError && !data
        ? "error"
        : "ready";
  const totalUnread = data?.total_unread ?? 0;

  return {
    status,
    rows,
    subtitle: totalUnread > 0 ? `${totalUnread} tin chưa đọc` : undefined,
    refreshing,
    isFetchingMore: isFetching && page > 1,
    refresh,
    loadMore,
    openConversation,
  };
}
