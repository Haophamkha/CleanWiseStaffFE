import * as Crypto from "expo-crypto";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import {
  useCreateChatbotConversationMutation,
  useDeleteChatbotConversationMutation,
  useLazyGetChatbotConversationsQuery,
  useLazyGetChatbotMessagesQuery,
  useSendChatbotMessageMutation,
} from "../api/chatbotApi";
import type { ChatbotConversation, DisplayChatbotMessage } from "../types/chatbot";
import { mergePages, prependOlder } from "../utils/chatbotUtils";

const PAGE_SIZE = 50;

export function useChatbot() {
  const dispatch = useAppDispatch();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DisplayChatbotMessage[]>([]);
  const [olderPage, setOlderPage] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [animateId, setAnimateId] = useState<number | string | null>(null);
  const [history, setHistory] = useState<ChatbotConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [createConv] = useCreateChatbotConversationMutation();
  const [sendMsg] = useSendChatbotMessageMutation();
  const [deleteConv] = useDeleteChatbotConversationMutation();
  const [fetchConvs] = useLazyGetChatbotConversationsQuery();
  const [fetchMsgs] = useLazyGetChatbotMessagesQuery();

  // BE trả tin nhắn CŨ -> MỚI (order_by id). Trang 1 là tin cũ nhất, nên phải lấy trang cuối.
  const readLatest = useCallback(
    async (id: number) => {
      const get = (page: number) => fetchMsgs({ conversationId: id, page }, false).unwrap();
      const first = await get(1);
      const lastPage = Math.max(1, Math.ceil(first.count / PAGE_SIZE));
      if (lastPage === 1) return { items: mergePages(first.results, []), olderPage: 0 };
      const last = await get(lastPage);
      const prev = lastPage === 2 ? first : await get(lastPage - 1);
      return { items: mergePages(prev.results, last.results), olderPage: lastPage - 2 };
    },
    [fetchMsgs],
  );

  const send = useCallback(
    async (raw: string, retryKey?: string) => {
      const text = raw.trim();
      if (!text || sending || loading || closed) return;
      const key = retryKey ?? Crypto.randomUUID();
      const localId = `local-${key}`;
      setDraft("");
      setSending(true);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== localId),
        { id: localId, role: "user", text, cards: [], status: "PROCESSING", client_message_id: key, run_id: null, created_at: new Date().toISOString() },
      ]);
      try {
        let id = conversationId;
        if (id == null) {
          const conv = await createConv().unwrap();
          id = conv.id;
          setConversationId(id);
        }
        const reply = await sendMsg({ conversationId: id, text, client_message_id: key }).unwrap();
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== localId && m.id !== reply.user_message.id);
          next.push(reply.user_message);
          if (reply.assistant_message) next.push(reply.assistant_message);
          return next;
        });
        if (reply.assistant_message && !reply.replayed) {
          setAnimateId(reply.assistant_message.id);
          // Bot có thể vừa nhận/từ chối lời mời hoặc gửi khiếu nại: làm mới dữ liệu các màn hình khác.
          dispatch(baseApi.util.invalidateTags([
            "MySchedules", "AvailableSchedules", "Wallet", "WalletTransactions", "Complaints", "Notifications",
          ]));
        }
      } catch {
        // Gửi lại cùng client_message_id: BE trả kết quả cũ (replayed) nên không bị trả lời 2 lần.
        setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, status: "LOCAL_FAILED" } : m)));
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending, loading, closed, createConv, sendMsg, dispatch],
  );

  const retry = (m: DisplayChatbotMessage) => {
    if (m.client_message_id) send(m.text, m.client_message_id);
  };

  const newChat = () => {
    if (sending) return;
    setConversationId(null);
    setMessages([]);
    setOlderPage(0);
    setClosed(false);
    setAnimateId(null);
    setDraft("");
  };

  const openConversation = async (conv: ChatbotConversation) => {
    if (sending) return;
    setLoading(true);
    try {
      const latest = await readLatest(conv.id);
      setConversationId(conv.id);
      setClosed(conv.status === "CLOSED");
      setAnimateId(null);
      setMessages(latest.items);
      setOlderPage(latest.olderPage);
    } catch {
      Alert.alert("Không mở được hội thoại", "Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadOlder = async () => {
    if (!conversationId || !olderPage || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await fetchMsgs({ conversationId, page: olderPage }, false).unwrap();
      setMessages((cur) => prependOlder(page.results, cur));
      setOlderPage((p) => p - 1);
    } catch {
      Alert.alert("Không tải được tin nhắn cũ", "Vui lòng thử lại.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const page = await fetchConvs({ page: 1 }, false).unwrap();
      setHistory(page.results);
    } catch {
      Alert.alert("Không tải được lịch sử", "Vui lòng thử lại.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const removeConversation = async (id: number) => {
    try {
      await deleteConv(id).unwrap();
      setHistory((h) => h.filter((c) => c.id !== id));
      if (id === conversationId) newChat();
    } catch {
      // BE trả 409 khi hội thoại đang xử lý tin nhắn
      Alert.alert("Không xoá được hội thoại", "Hội thoại có thể đang xử lý. Vui lòng thử lại sau.");
    }
  };

  return {
    conversationId, messages, draft, setDraft, sending, loading, closed, animateId, setAnimateId,
    hasOlder: olderPage > 0, loadingOlder, loadOlder,
    history, historyLoading, send, retry, newChat, openConversation, loadHistory, removeConversation,
  };
}
