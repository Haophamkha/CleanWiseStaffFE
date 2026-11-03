import { useTranslation } from "react-i18next";

import { TabHeader } from "@/components/common/TabHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { ConversationItem } from "@/features/chat/components/ConversationItem";
import { useChatInbox } from "@/features/chat/hooks/useChatInbox";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

/** Khung chờ khi đang tải danh sách. */
function InboxSkeleton() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View className="pt-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Animated.View
          key={i}
          className="flex-row items-center px-5"
          style={{ height: 76, opacity: pulse }}
        >
          <View className="w-[52px] h-[52px] rounded-full bg-accent-light mr-3.5" />
          <View className="flex-1">
            <View className="h-3.5 w-1/2 rounded-full bg-accent-light mb-2.5" />
            <View className="h-3 w-4/5 rounded-full bg-accent-light" />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

/** Trạng thái chưa có cuộc trò chuyện: thoáng, không khung card. */
function EmptyInbox() {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-10"
      style={{ paddingBottom: 80 }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: COLORS.primarySoft,
        }}
      >
        <View
          className="items-center justify-center"
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.primaryLight,
          }}
        >
          <Feather name="message-circle" size={34} color={COLORS.primary} />
        </View>
      </View>

      <Text
        className="text-ink font-extrabold text-center"
        style={{ fontSize: 18, lineHeight: 24, marginTop: 24 }}
      >
        {tr("Chưa có cuộc trò chuyện nào")}
      </Text>
      <Text
        className="text-ink-soft text-center"
        style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}
      >
        {tr(
          "Tin nhắn với khách hàng sẽ xuất hiện ở đây sau khi bạn nhận việc.",
        )}
      </Text>
    </View>
  );
}

export function ChatInbox(_props: { staff?: boolean }) {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();
  const inbox = useChatInbox();

  return (
    <View className="flex-1 bg-canvas">
      <TabHeader title={tr("Tin nhắn")} subtitle={inbox.subtitle} />

      {inbox.status === "guest" ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState icon="lock" title={tr("Đăng nhập để xem tin nhắn")} />
        </View>
      ) : inbox.status === "loading" ? (
        <InboxSkeleton />
      ) : inbox.status === "error" ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon="alert-circle"
            title={tr("Không tải được tin nhắn")}
            actionLabel={tr("Thử lại")}
            onAction={() => {
              void inbox.refresh();
            }}
          />
        </View>
      ) : (
        <FlatList
          data={inbox.rows}
          keyExtractor={(row) => String(row.id)}
          renderItem={({ item, index }) => (
            <ConversationItem
              row={item}
              onPress={inbox.openConversation}
              index={index}
            />
          )}
          contentContainerStyle={{
            paddingTop: 4,
            paddingBottom: 120,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={inbox.refreshing}
              onRefresh={() => {
                void inbox.refresh();
              }}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={inbox.loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<EmptyInbox />}
          ListFooterComponent={
            inbox.isFetchingMore ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}
