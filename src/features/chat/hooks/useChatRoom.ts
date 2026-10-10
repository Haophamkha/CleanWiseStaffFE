import {
    useGetConversationQuery,
    useListChatMessagesMutation,
    useReadChatMessagesMutation,
    useSendChatMessageMutation,
} from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import {
    getChatBlockedMessage,
    restoreBlockedDraft,
} from "@/features/chat/utils/chatModeration";
import type { ChatAssignment, ChatMessage } from "@/features/chat/types/chat";
import { useAppSelector } from "@/store/hooks";
import { showErrorToast } from "@/utils/toast";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Keyboard,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UiChatMessage = ChatMessage & { localStatus?: "sending" | "failed" };

export type ChatListItem =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "system";
      key: string;
      title: string;
      assignment: string | null;
      text: string;
      timeLabel: string;
    }
  | {
      kind: "message";
      key: string;
      id: number;
      mine: boolean;
      text: string;
      showAvatar: boolean;
      joinsNewer: boolean;
      joinsOlder: boolean;
      showMeta: boolean;
      metaText: string;
      failed: boolean;
    };

function mergeMessages(
  current: UiChatMessage[],
  incoming: ChatMessage[],
): UiChatMessage[] {
  const next = [...current];
  for (const message of incoming) {
    const savedIndex = next.findIndex((item) => item.id === message.id);
    if (savedIndex >= 0) {
      next[savedIndex] = {
        ...message,
        is_read: message.is_read || next[savedIndex].is_read,
      };
      continue;
    }
    if (message.message_type === "TEXT") {
      const matchesLocal = (item: UiChatMessage) => {
        const elapsedMs =
          new Date(message.created_at).getTime() -
          new Date(item.created_at).getTime();
        return (
          item.sender_id === message.sender_id &&
          item.message === message.message &&
          elapsedMs >= -5000 &&
          elapsedMs < 120000
        );
      };
      let pendingIndex = next.findIndex(
        (item) => item.localStatus === "sending" && matchesLocal(item),
      );
      if (pendingIndex < 0) {
        pendingIndex = next.findIndex(
          (item) => item.localStatus === "failed" && matchesLocal(item),
        );
      }
      if (pendingIndex >= 0) next.splice(pendingIndex, 1);
    }
    next.push(message);
  }
  return next.sort((a, b) => a.id - b.id);
}

const dayKey = (iso: string) => new Date(iso).toDateString();
const isSameDay = (a: string, b: string) => dayKey(a) === dayKey(b);

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hôm nay";
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function useChatRoom(id: number) {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError, refetch } = useGetConversationQuery(id, {
    skip: !Number.isFinite(id),
  });
  const [listMessages, { isLoading: loadingMessages }] =
    useListChatMessagesMutation();
  const [sendMessage] = useSendChatMessageMutation();
  const [markRead] = useReadChatMessagesMutation();
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [draft, setDraft] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(
    null,
  );
  const draftRef = useRef("");
  const list = useRef<FlatList<ChatListItem>>(null);
  const scrollToLatestRef = useRef(true);
  const nearLatestRef = useRef(true);
  const focusedRef = useRef(false);
  const typingActiveRef = useRef(false);
  const lastTypingSentRef = useRef(0);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localSequence = useRef(0);
  const inFlight = useRef(new Set<number>());
  const bottomPadding = keyboardVisible ? 12 : Math.max(insets.bottom, 16) + 10;
  const conversation = data?.conversation;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const scrollToLatest = useCallback((animated = false) => {
    nearLatestRef.current = true;
    scrollToLatestRef.current = true;
    requestAnimationFrame(() =>
      list.current?.scrollToOffset({ offset: 0, animated }),
    );
  }, []);

  const reload = useCallback(async () => {
    try {
      const page = await listMessages({
        conversation_id: id,
        limit: 30,
      }).unwrap();
      setMessages((previous) => mergeMessages(previous, page.results));
      setCursor(page.next_cursor);
      setLoaded(true);
      setMessageError(false);
    } catch {
      setLoaded(true);
      setMessageError(true);
    }
  }, [id, listMessages]);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      markRead({ conversation_id: id });
      scrollToLatest();
      refetch();
      reload();
      return () => {
        focusedRef.current = false;
      };
    }, [id, markRead, refetch, reload, scrollToLatest]),
  );

  const { sendTyping } = useChatSocket(
    !!user && Number.isFinite(id),
    (event) => {
      if (event.type === "conversation.updated" && event.conversation_id === id) {
        refetch();
        return;
      }
      if (
        event.type === "message.created" &&
        event.message?.conversation_id === id
      ) {
        setMessages((previous) => mergeMessages(previous, [event.message!]));
        if (focusedRef.current && nearLatestRef.current) scrollToLatest(true);
        if (focusedRef.current && event.message.sender_id !== user?.id)
          markRead({ conversation_id: id });
      } else if (
        event.type === "messages.read" &&
        event.conversation_id === id
      ) {
        setMessages((previous) =>
          previous.map((message) =>
            message.sender_id === user?.id
              ? { ...message, is_read: true }
              : message,
          ),
        );
      } else if (
        event.type === "typing.changed" &&
        event.conversation_id === id &&
        event.user_id !== user?.id
      ) {
        if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
        setOtherTyping(!!event.is_typing);
        if (event.is_typing) {
          otherTypingTimer.current = setTimeout(
            () => setOtherTyping(false),
            5000,
          );
        }
      }
    },
    () => {
      reload();
      if (focusedRef.current) markRead({ conversation_id: id });
    },
  );

  const stopTyping = useCallback(() => {
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = null;
    if (typingActiveRef.current) sendTyping(id, false);
    typingActiveRef.current = false;
    lastTypingSentRef.current = 0;
  }, [id, sendTyping]);

  const updateDraft = (value: string) => {
    draftRef.current = value;
    setDraft(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (!typingActiveRef.current || now - lastTypingSentRef.current > 2000) {
      sendTyping(id, true);
      typingActiveRef.current = true;
      lastTypingSentRef.current = now;
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(stopTyping, 2200);
  };

  useEffect(
    () => () => {
      stopTyping();
      if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
    },
    [stopTyping],
  );

  useFocusEffect(useCallback(() => () => stopTyping(), [stopTyping]));

  const loadOlder = async () => {
    if (!cursor || loadingMessages) return;
    try {
      const page = await listMessages({
        conversation_id: id,
        cursor,
        limit: 30,
      }).unwrap();
      scrollToLatestRef.current = false;
      setMessages((previous) => mergeMessages(previous, page.results));
      setCursor(page.next_cursor);
    } catch {
      Alert.alert("Lỗi", "Không tải được tin nhắn cũ.");
    }
  };

  const submit = async (text: string, retryId?: number) => {
    if (!text || !conversation?.can_send || !user?.id) return;
    stopTyping();
    const localId =
      retryId ?? Date.now() * 1000 + (++localSequence.current % 1000);
    if (inFlight.current.has(localId)) return;
    inFlight.current.add(localId);
    if (retryId) {
      setMessages((previous) =>
        previous.map((item) =>
          item.id === localId ? { ...item, localStatus: "sending" } : item,
        ),
      );
    } else {
      const optimistic: UiChatMessage = {
        id: localId,
        conversation_id: id,
        sender_id: user.id,
        recipient_id: null,
        related_assignment_id: null,
        message: text,
        message_type: "TEXT",
        attachment: null,
        is_read: false,
        created_at: new Date().toISOString(),
        localStatus: "sending",
      };
      setMessages((previous) => [...previous, optimistic]);
      draftRef.current = "";
      setDraft("");
    }
    scrollToLatest(true);
    try {
      const saved = await sendMessage({
        conversation_id: id,
        message: text,
      }).unwrap();
      setMessages((previous) =>
        mergeMessages(
          previous.filter((item) => item.id !== localId),
          [saved],
        ),
      );
      scrollToLatest();
    } catch (error) {
      const blockedMessage = getChatBlockedMessage(error);
      if (blockedMessage) {
        setMessages((previous) => previous.filter((item) => item.id !== localId));
        draftRef.current = restoreBlockedDraft(text, draftRef.current);
        setDraft(draftRef.current);
        showErrorToast("Không thể gửi tin nhắn", blockedMessage);
        return;
      }
      setMessages((previous) =>
        previous.map((item) =>
          item.id === localId ? { ...item, localStatus: "failed" } : item,
        ),
      );
      refetch();
    } finally {
      inFlight.current.delete(localId);
    }
  };

  const items = useMemo<ChatListItem[]>(() => {
    const ordered = [...messages].reverse();
    const latestSentId = ordered.find(
      (message) =>
        message.message_type !== "SYSTEM" && message.sender_id === user?.id,
    )?.id;
    const result: ChatListItem[] = [];

    ordered.forEach((item, index) => {
      const newer = ordered[index - 1];
      const older = ordered[index + 1];

      if (item.message_type === "SYSTEM") {
        const related: ChatAssignment | undefined = data?.assignments.find(
          (assignment) =>
            assignment.assignment_id === item.related_assignment_id,
        );
        result.push({
          kind: "system",
          key: String(item.id),
          title: "Thông báo lịch làm",
          assignment: related
            ? `${related.service_name} · ${related.booking_code}`
            : null,
          text: item.message,
          timeLabel: new Date(item.created_at).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        });
      } else {
        const mine = item.sender_id === user?.id;
        const joinsNewer =
          !!newer &&
          newer.message_type !== "SYSTEM" &&
          newer.sender_id === item.sender_id &&
          isSameDay(newer.created_at, item.created_at);
        const joinsOlder =
          !!older &&
          older.message_type !== "SYSTEM" &&
          older.sender_id === item.sender_id &&
          isSameDay(older.created_at, item.created_at);
        const showMeta =
          !!item.localStatus ||
          (mine && item.id === latestSentId) ||
          item.id === expandedMessageId;
        const status = !mine
          ? ""
          : item.localStatus === "sending"
            ? " · Đang gửi"
            : item.localStatus === "failed"
              ? " · Gửi lỗi, chạm để thử lại"
              : item.is_read
                ? " · Đã xem"
                : " · Đã gửi";
        result.push({
          kind: "message",
          key: String(item.id),
          id: item.id,
          mine,
          text: item.message,
          showAvatar: !joinsNewer,
          joinsNewer,
          joinsOlder,
          showMeta,
          metaText: `${formatTime(item.created_at)}${status}`,
          failed: item.localStatus === "failed",
        });
      }

      if (!older || !isSameDay(older.created_at, item.created_at)) {
        result.push({
          kind: "day",
          key: `day-${dayKey(item.created_at)}`,
          label: formatDayLabel(item.created_at),
        });
      }
    });
    return result;
  }, [messages, data?.assignments, user?.id, expandedMessageId]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    nearLatestRef.current = event.nativeEvent.contentOffset.y < 80;
    if (!nearLatestRef.current) scrollToLatestRef.current = false;
  };

  const onContentSizeChange = () => {
    if (scrollToLatestRef.current && messages.length > 0) {
      list.current?.scrollToOffset({ offset: 0, animated: false });
      scrollToLatestRef.current = false;
    }
  };

  const status: "loading" | "error" | "ready" =
    isLoading && !data
      ? "loading"
      : isError || !conversation
        ? "error"
        : "ready";

  return {
    status,
    conversation,
    topInset: insets.top,
    bottomPadding,
    list,
    items,
    cursor,
    loaded,
    messageError,
    loadingMessages,
    otherTyping,
    draft,
    hasDraft: !!draft.trim(),
    canSend: !!conversation?.can_send,
    updateDraft,
    stopTyping,
    sendDraft: () => submit(draftRef.current.trim()),
    retryMessage: (messageId: number, text: string) => submit(text, messageId),
    toggleMeta: (messageId: number) =>
      setExpandedMessageId((current) =>
        current === messageId ? null : messageId,
      ),
    loadOlder,
    reload,
    onScroll,
    onContentSizeChange,
    goBack: () => router.back(),
  };
}
