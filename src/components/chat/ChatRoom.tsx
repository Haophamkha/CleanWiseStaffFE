import { useChatSocket } from "@/hooks/useChatSocket";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ENV } from "@/config/env";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import {
  useGetConversationQuery, useListChatMessagesMutation,
  useReadChatMessagesMutation, useSendChatMessageMutation,
} from "@/services/chatApi";
import { useAppSelector } from "@/store/hooks";
import type { ChatAssignment, ChatMessage } from "@/types/chat";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, Keyboard, KeyboardAvoidingView,
  Platform, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UiChatMessage = ChatMessage & { localStatus?: "sending" | "failed" };

function ChatAvatar({ uri }: { uri?: string | null }) {
  return (
    <View className="w-8 h-8 rounded-full bg-[#E5E7EB] items-center justify-center overflow-hidden">
      {uri
        ? <Image source={{ uri }} className="w-8 h-8" />
        : <Feather name="user" size={16} color="#6B7280" />}
    </View>
  );
}

function mergeMessages(current: UiChatMessage[], incoming: ChatMessage[]): UiChatMessage[] {
  const next = [...current];
  for (const message of incoming) {
    const savedIndex = next.findIndex((item) => item.id === message.id);
    if (savedIndex >= 0) {
      next[savedIndex] = { ...message, is_read: message.is_read || next[savedIndex].is_read };
      continue;
    }
    if (message.message_type === "TEXT") {
      const matchesLocal = (item: UiChatMessage) => {
        const elapsedMs =
          new Date(message.created_at).getTime() - new Date(item.created_at).getTime();
        return (
        item.sender_id === message.sender_id &&
        item.message === message.message &&
        elapsedMs >= -5000 && elapsedMs < 120000
        );
      };
      let pendingIndex = next.findIndex((item) => item.localStatus === "sending" && matchesLocal(item));
      if (pendingIndex < 0) {
        pendingIndex = next.findIndex((item) => item.localStatus === "failed" && matchesLocal(item));
      }
      if (pendingIndex >= 0) next.splice(pendingIndex, 1);
    }
    next.push(message);
  }
  return next.sort((a, b) => a.id - b.id);
}

export function ChatRoom({ id, staff = false }: {
  id: number; assignmentId?: number; staff?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { data: ownProfile } = useGetWorkerProfileQuery();
  const ownAvatar = ownProfile?.portrait
    ? ownProfile.portrait.startsWith("http") ? ownProfile.portrait : `${ENV.API_URL}${ownProfile.portrait}`
    : null;
  const { data, isLoading, isError, refetch } = useGetConversationQuery(id, { skip: !Number.isFinite(id) });
  const [listMessages, { isLoading: loadingMessages }] = useListChatMessagesMutation();
  const [sendMessage] = useSendChatMessageMutation();
  const [markRead] = useReadChatMessagesMutation();
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [draft, setDraft] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const draftRef = useRef("");
  const list = useRef<FlatList<UiChatMessage>>(null);
  const scrollToLatestRef = useRef(true);
  const nearLatestRef = useRef(true);
  const focusedRef = useRef(false);
  const typingActiveRef = useRef(false);
  const lastTypingSentRef = useRef(0);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localSequence = useRef(0);
  const inFlight = useRef(new Set<number>());
  const accent = staff ? "#2563EB" : "#047857";
  const pale = staff ? "#EFF6FF" : "#ECFDF5";
  const bottomPadding = keyboardVisible ? 12 : Math.max(insets.bottom, 16) + 10;
  const conversation = data?.conversation;
  const displayMessages = useMemo(() => [...messages].reverse(), [messages]);
  const latestSentId = displayMessages.find((message) =>
    message.message_type !== "SYSTEM" && message.sender_id === user?.id
  )?.id;

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
    requestAnimationFrame(() => list.current?.scrollToOffset({ offset: 0, animated }));
  }, []);

  const reload = useCallback(async () => {
    try {
      const page = await listMessages({ conversation_id: id, limit: 30 }).unwrap();
      setMessages((previous) => mergeMessages(previous, page.results));
      setCursor(page.next_cursor);
      setLoaded(true);
      setMessageError(false);
    } catch {
      setLoaded(true);
      setMessageError(true);
    }
  }, [id, listMessages]);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    markRead({ conversation_id: id });
    scrollToLatest();
    refetch();
    reload();
    return () => { focusedRef.current = false; };
  }, [id, markRead, refetch, reload, scrollToLatest]));

  const { sendTyping } = useChatSocket(!!user && Number.isFinite(id), (event) => {
    if (event.type === "message.created" && event.message?.conversation_id === id) {
      setMessages((previous) => mergeMessages(previous, [event.message!]));
      if (focusedRef.current && nearLatestRef.current) scrollToLatest(true);
      if (focusedRef.current && event.message.sender_id !== user?.id) markRead({ conversation_id: id });
    } else if (event.type === "messages.read" && event.conversation_id === id) {
      setMessages((previous) => previous.map((message) =>
        message.sender_id === user?.id ? { ...message, is_read: true } : message
      ));
    } else if (event.type === "typing.changed" && event.conversation_id === id && event.user_id !== user?.id) {
      if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
      setOtherTyping(!!event.is_typing);
      if (event.is_typing) {
        otherTypingTimer.current = setTimeout(() => setOtherTyping(false), 5000);
      }
    }
  }, () => {
    reload();
    if (focusedRef.current) markRead({ conversation_id: id });
  });

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

  useEffect(() => () => {
    stopTyping();
    if (otherTypingTimer.current) clearTimeout(otherTypingTimer.current);
  }, [stopTyping]);

  useFocusEffect(useCallback(() => () => stopTyping(), [stopTyping]));

  const loadOlder = async () => {
    if (!cursor || loadingMessages) return;
    try {
      const page = await listMessages({ conversation_id: id, cursor, limit: 30 }).unwrap();
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
    const localId = retryId ?? Date.now() * 1000 + (++localSequence.current % 1000);
    if (inFlight.current.has(localId)) return;
    inFlight.current.add(localId);
    if (retryId) {
      setMessages((previous) => previous.map((item) =>
        item.id === localId ? { ...item, localStatus: "sending" } : item
      ));
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
      const saved = await sendMessage({ conversation_id: id, message: text }).unwrap();
      setMessages((previous) => mergeMessages(previous.filter((item) => item.id !== localId), [saved]));
      scrollToLatest();
    } catch {
      setMessages((previous) => previous.map((item) =>
        item.id === localId ? { ...item, localStatus: "failed" } : item
      ));
      refetch();
    } finally {
      inFlight.current.delete(localId);
    }
  };

  const renderMessage = ({ item, index }: { item: UiChatMessage; index: number }) => {
    if (item.message_type === "SYSTEM") {
      const relatedAssignment: ChatAssignment | undefined = data?.assignments.find(
        (assignment) => assignment.assignment_id === item.related_assignment_id,
      );
      return (
        <View className="px-4 my-3 flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-[#E5E7EB] items-center justify-center mr-2">
            <Feather name="bell" size={16} color="#6B7280" />
          </View>
          <View className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden" style={{ width: "86%", maxWidth: 440, flexShrink: 1 }}>
            <View className="px-4 py-3" style={{ backgroundColor: pale }}>
              <Text className="text-base font-bold" style={{ color: accent }}>Thông báo lịch làm</Text>
              {relatedAssignment && (
                <Text className="text-xs text-[#4B5563] mt-1">
                  {relatedAssignment.service_name} · {relatedAssignment.booking_code}
                </Text>
              )}
            </View>
            <View className="px-4 py-4">
              <Text className="text-[15px] leading-6 text-[#111827]">{item.message}</Text>
            </View>
            <View className="px-4 py-2 border-t border-[#F3F4F6]">
              <Text className="text-xs text-[#9CA3AF]">
                {new Date(item.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    const mine = item.sender_id === user?.id;
    const newer = displayMessages[index - 1];
    const older = displayMessages[index + 1];
    const showAvatar = !newer || newer.message_type === "SYSTEM" || newer.sender_id !== item.sender_id;
    const sameAsOlder = older?.message_type !== "SYSTEM" && older?.sender_id === item.sender_id;
    const showMetadata =
      !!item.localStatus || (mine && item.id === latestSentId) || item.id === expandedMessageId;
    return (
      <View className={`px-4 ${sameAsOlder ? "mb-1" : "mb-3"}`}>
        <View className={`flex-row items-end ${mine ? "justify-end" : "justify-start"}`}>
          {!mine && (
            <View className="w-8 mr-2">
              {showAvatar && <ChatAvatar uri={conversation?.other_user.avatar} />}
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setExpandedMessageId((current) => current === item.id ? null : item.id)}
            className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine ? "rounded-br-sm" : "rounded-bl-sm bg-white border border-[#E5E7EB]"}`}
            style={mine ? { backgroundColor: accent } : undefined}
          >
            <Text className={`text-[15px] ${mine ? "text-white" : "text-[#111827]"}`}>{item.message}</Text>
          </TouchableOpacity>
          {mine && (
            <View className="w-8 ml-2">
              {showAvatar && <ChatAvatar uri={ownAvatar} />}
            </View>
          )}
        </View>
        {showMetadata && (
          <View className={mine ? "items-end" : "items-start"} style={mine ? { marginRight: 40 } : { marginLeft: 40 }}>
            <TouchableOpacity
              onPress={() => { if (item.localStatus === "failed") submit(item.message, item.id); }}
              disabled={item.localStatus !== "failed"}
              className="mt-1 mx-1"
            >
              <Text className="text-[11px]" style={{ color: item.localStatus === "failed" ? "#DC2626" : "#9CA3AF" }}>
                {new Date(item.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                {mine
                  ? item.localStatus === "sending" ? " · Đang gửi"
                    : item.localStatus === "failed" ? " · Gửi lỗi, chạm để thử lại"
                      : item.is_read ? " · Đã xem" : " · Đã gửi"
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !data) return <View className="flex-1 justify-center"><ActivityIndicator color={accent} /></View>;
  if (isError || !conversation) return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-[#6B7280] mb-4">Không mở được cuộc trò chuyện</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ color: accent }}>Quay lại</Text></TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#F8F9FC]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="bg-white pt-14 px-5 pb-4 border-b border-[#F3F4F6] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center overflow-hidden mr-3">
          {conversation.other_user.avatar
            ? <Image source={{ uri: conversation.other_user.avatar }} className="w-10 h-10" />
            : <Feather name="user" size={18} color="#9CA3AF" />}
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-[#111827]" numberOfLines={1}>{conversation.other_user.name}</Text>
          <Text className="text-xs text-[#6B7280]">{staff ? "Khách hàng" : "Nhân viên phụ trách"}</Text>
        </View>
      </View>
      <FlatList
        ref={list}
        inverted
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        data={displayMessages}
        extraData={`${expandedMessageId}:${latestSentId}:${user?.id}`}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        onScroll={(event) => {
          nearLatestRef.current = event.nativeEvent.contentOffset.y < 80;
          if (!nearLatestRef.current) scrollToLatestRef.current = false;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 12, flexGrow: 1 }}
        ListHeaderComponent={otherTyping ? <TypingIndicator avatar={conversation.other_user.avatar} /> : null}
        ListFooterComponent={cursor ? (
          <TouchableOpacity onPress={loadOlder} disabled={loadingMessages} className="items-center py-2">
            <Text style={{ color: accent }}>{loadingMessages ? "Đang tải..." : "Xem tin nhắn cũ"}</Text>
          </TouchableOpacity>
        ) : null}
        ListEmptyComponent={loaded ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#9CA3AF]">{messageError ? "Không tải được tin nhắn" : "Chưa có tin nhắn"}</Text>
            {messageError && <TouchableOpacity onPress={reload} className="mt-3"><Text style={{ color: accent }}>Thử lại</Text></TouchableOpacity>}
          </View>
        ) : <ActivityIndicator color={accent} />}
        onContentSizeChange={() => {
          if (scrollToLatestRef.current && messages.length > 0) {
            list.current?.scrollToOffset({ offset: 0, animated: false });
            scrollToLatestRef.current = false;
          }
        }}
      />
      {conversation.can_send ? (
        <View
          className="bg-white border-t border-[#F3F4F6] px-4 flex-row items-end"
          style={{ paddingTop: 14, paddingBottom: bottomPadding }}
        >
          <TextInput
            value={draft} onChangeText={updateDraft} onBlur={stopTyping}
            placeholder="Nhập tin nhắn..." placeholderTextColor="#9CA3AF"
            multiline maxLength={2000}
            className="flex-1 bg-[#F8F9FC] rounded-2xl px-4 mr-2 max-h-28 text-[#111827]"
            style={{ minHeight: 48, paddingVertical: 12 }}
          />
          <TouchableOpacity
            onPress={() => submit(draftRef.current.trim())} disabled={!draft.trim()}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: draft.trim() ? accent : "#D1D5DB" }}
          >
            <Feather name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          className="bg-white border-t border-[#F3F4F6] px-5 pt-4"
          style={{ paddingBottom: bottomPadding }}
        >
          <Text className="text-center text-sm text-[#6B7280]">Lịch này đã kết thúc, bạn vẫn có thể xem lịch sử trò chuyện.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
