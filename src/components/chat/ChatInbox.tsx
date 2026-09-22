import { useChatSocket } from "@/hooks/useChatSocket";
import { chatApi, useGetConversationsQuery, useReadChatMessagesMutation } from "@/services/chatApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ChatConversation } from "@/types/chat";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View,
} from "react-native";

export function ChatInbox({ staff = false }: { staff?: boolean }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [markRead] = useReadChatMessagesMutation();
  const readingRef = useRef(new Set<number>());
  const { data, isLoading, isFetching, isError, refetch } = useGetConversationsQuery(page, {
    skip: !user,
    refetchOnMountOrArgChange: 15,
  });
  const accent = staff ? "#2563EB" : "#047857";
  const pale = staff ? "#EFF6FF" : "#ECFDF5";
  const unreadBorder = staff ? "#BFDBFE" : "#A7F3D0";

  useEffect(() => {
    if (!data) return;
    setItems((previous) => {
      if (page === 1) return data.results;
      const byId = new Map(previous.map((item) => [item.id, item]));
      data.results.forEach((item) => byId.set(item.id, item));
      return [...byId.values()];
    });
  }, [data, page]);

  useChatSocket(!!user, (event) => {
    if (event.type === "message.created" || event.type === "messages.read") {
      setPage(1);
      refetch();
    }
  }, refetch);

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
    setItems((previous) => previous.map((conversation) =>
      conversation.id === item.id ? { ...conversation, unread_count: 0 } : conversation
    ));
    const updateUnread = (draft: import("@/types/chat").ConversationPage) => {
      draft.total_unread = Math.max(0, draft.total_unread - item.unread_count);
      const conversation = draft.results.find((row) => row.id === item.id);
      if (conversation) conversation.unread_count = 0;
    };
    dispatch(chatApi.util.updateQueryData("getConversations", 1, updateUnread));
    if (page !== 1) {
      dispatch(chatApi.util.updateQueryData("getConversations", page, updateUnread));
    }
    void markRead({ conversation_id: item.id }).unwrap()
      .catch(() => { void refetch(); })
      .finally(() => { readingRef.current.delete(item.id); });
  };

  const renderItem = ({ item }: { item: ChatConversation }) => {
    const unread = item.unread_count > 0;
    return (
    <TouchableOpacity
      onPress={() => {
        readOnOpen(item);
        router.push({ pathname: "/messages/[id]", params: { id: String(item.id) } });
      }}
      activeOpacity={0.8}
      className="flex-row items-center rounded-2xl bg-white border border-[#E5E7EB] p-4 mb-3"
      style={unread ? { backgroundColor: pale, borderColor: unreadBorder } : undefined}
    >
      <View className="w-14 h-14 rounded-full bg-[#F3F4F6] items-center justify-center overflow-hidden mr-3">
        {item.other_user.avatar ? (
          <Image source={{ uri: item.other_user.avatar }} className="w-14 h-14" />
        ) : <Feather name="user" size={24} color="#9CA3AF" />}
        {unread && <View className="absolute right-0 top-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: accent }} />}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text numberOfLines={1} className="text-base font-bold text-[#111827] flex-1 mr-2">
            {item.other_user.name}
          </Text>
          {!!item.last_message_at && (
            <Text className="text-xs text-[#9CA3AF]">
              {new Date(item.last_message_at).toLocaleDateString("vi-VN")}
            </Text>
          )}
        </View>
        {!!item.latest_assignment && (
          <View className="self-start rounded-full px-2.5 py-1 mt-1" style={{ backgroundColor: pale }}>
            <Text className="text-xs font-semibold" style={{ color: accent }}>
              {item.latest_assignment.booking_code}
            </Text>
          </View>
        )}
        <View className="flex-row items-center mt-1.5">
          <Text numberOfLines={1} className={`flex-1 text-sm mr-2 ${unread ? "font-semibold text-[#111827]" : "text-[#4B5563]"}`}>
            {item.last_message || "Bắt đầu trò chuyện"}
          </Text>
          {item.unread_count > 0 && (
            <View className="min-w-5 h-5 rounded-full px-1 items-center justify-center" style={{ backgroundColor: accent }}>
              <Text className="text-white text-xs font-bold">{item.unread_count > 99 ? "99+" : item.unread_count}</Text>
            </View>
          )}
        </View>
        {unread && <Text className="text-xs font-semibold mt-1" style={{ color: accent }}>Chưa xem</Text>}
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#F3F4F6]">
        <Text className="text-xl font-bold text-center" style={{ color: accent }}>Tin nhắn</Text>
      </View>
      {!user ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="lock" size={32} color="#9CA3AF" />
          <Text className="text-[#6B7280] mt-3 text-center">Đăng nhập để xem tin nhắn</Text>
        </View>
      ) : isLoading && !data ? (
        <View className="flex-1 justify-center"><ActivityIndicator color={accent} /></View>
      ) : isError && !data ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#6B7280] mb-3">Không tải được tin nhắn</Text>
          <TouchableOpacity onPress={() => { void refresh(); }}><Text style={{ color: accent }}>Thử lại</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={accent} />}
          onEndReached={() => { if (data?.next && !isFetching) setPage((value) => value + 1); }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Feather name="message-circle" size={40} color="#D1D5DB" />
              <Text className="text-[#9CA3AF] mt-3">Chưa có cuộc trò chuyện nào</Text>
            </View>
          }
          ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator color={accent} /> : null}
        />
      )}
    </View>
  );
}
