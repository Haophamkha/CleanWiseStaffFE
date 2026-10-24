import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatbot } from "../hooks/useChatbot";
import { useChatbotCardNavigation } from "../hooks/useChatbotCardNavigation";
import { ChatbotComposer } from "./ChatbotComposer";
import { ChatbotHistorySheet } from "./ChatbotHistorySheet";
import { ChatbotMessageBubble } from "./ChatbotMessageBubble";
import { ChatbotThinkingIndicator } from "./ChatbotThinkingIndicator";
import { ChatbotWelcome } from "./ChatbotWelcome";

// Nút giữa của AppTabBar tràn lên ~24px trên thanh tab, nên chừa chỗ để không che ô nhập.
const TAB_OVERHANG_SPACE = 30;

export default function ChatbotScreen() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const bot = useChatbot();
  const { openCard } = useChatbotCardNavigation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const listRef = useRef<FlatList>(null);
  const skipScroll = useRef(false);
  const empty = bot.messages.length === 0;

  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboard(true));
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboard(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const scrollEnd = () => {
    if (skipScroll.current) return;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };
  const loadOlder = async () => {
    skipScroll.current = true; // không nhảy xuống cuối khi chèn tin cũ lên đầu
    await bot.loadOlder();
    setTimeout(() => { skipScroll.current = false; }, 400);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="text-ink text-xl font-extrabold">{tr("Trợ lý CleanWise")}</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => setHistoryOpen(true)} className="w-10 h-10 rounded-full bg-surface border border-line items-center justify-center mr-2"
            accessibilityRole="button" accessibilityLabel={tr("Lịch sử trò chuyện")}>
            <Feather name="clock" size={18} color={COLORS.ink} />
          </TouchableOpacity>
          <TouchableOpacity onPress={bot.newChat} disabled={bot.sending} className="w-10 h-10 rounded-full bg-surface border border-line items-center justify-center"
            accessibilityRole="button" accessibilityLabel={tr("Cuộc trò chuyện mới")}>
            <Feather name="edit" size={18} color={COLORS.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {bot.loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          className="flex-1"
          data={bot.messages}
          keyExtractor={(m) => String(m.id)}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollEnd}
          ListHeaderComponent={
            empty ? (
              <ChatbotWelcome onAsk={(t) => bot.send(t)} disabled={bot.sending} />
            ) : bot.hasOlder ? (
              <TouchableOpacity onPress={loadOlder} disabled={bot.loadingOlder} className="items-center py-3" accessibilityRole="button">
                {bot.loadingOlder ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text className="text-primary-dark text-sm font-semibold">{tr("Xem tin nhắn cũ hơn")}</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListFooterComponent={bot.sending ? <ChatbotThinkingIndicator /> : null}
          renderItem={({ item }) => (
            <ChatbotMessageBubble
              message={item}
              animate={item.id === bot.animateId}
              onRevealDone={() => { bot.setAnimateId(null); scrollEnd(); }}
              onRetry={() => bot.retry(item)}
              onOpenCard={openCard}
            />
          )}
        />
      )}

      <ChatbotComposer draft={bot.draft} onChange={bot.setDraft} onSend={() => bot.send(bot.draft)}
        disabled={bot.sending || bot.loading} closed={bot.closed}
        bottomPadding={keyboard ? 8 : TAB_OVERHANG_SPACE} />

      <ChatbotHistorySheet
        visible={historyOpen}
        items={bot.history}
        loading={bot.historyLoading}
        activeId={bot.conversationId}
        onClose={() => setHistoryOpen(false)}
        onLoad={bot.loadHistory}
        onSelect={(c) => { setHistoryOpen(false); bot.openConversation(c); }}
        onDelete={bot.removeConversation}
      />
    </KeyboardAvoidingView>
  );
}
