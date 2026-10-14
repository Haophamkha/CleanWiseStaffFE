import { COLORS, OVERLAY } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import type { ChatbotConversation } from "../types/chatbot";

type Props = {
  visible: boolean;
  items: ChatbotConversation[];
  loading: boolean;
  activeId: number | null;
  onClose: () => void;
  onLoad: () => void;
  onSelect: (c: ChatbotConversation) => void;
  onDelete: (id: number) => void;
};

export function ChatbotHistorySheet({ visible, items, loading, activeId, onClose, onLoad, onSelect, onDelete }: Props) {
  useEffect(() => { if (visible) onLoad(); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  const confirmDelete = (c: ChatbotConversation) =>
    Alert.alert("Xoá hội thoại", "Hội thoại này sẽ bị xoá và không thể khôi phục.", [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: () => onDelete(c.id) },
    ]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: OVERLAY }} onPress={onClose} />
      <View className="bg-canvas rounded-t-[32px] px-5 pt-5 pb-8" style={{ maxHeight: "70%" }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-ink text-lg font-extrabold">Lịch sử trò chuyện</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng">
            <Feather name="x" size={22} color={COLORS.ink} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 24 }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(c) => String(c.id)}
            ListEmptyComponent={<Text className="text-ink-soft text-center py-8">Chưa có hội thoại nào.</Text>}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View className={`flex-row items-center bg-surface border rounded-2xl ${item.id === activeId ? "border-primary" : "border-line"}`}>
                <TouchableOpacity className="flex-1 px-4 py-3" onPress={() => onSelect(item)} activeOpacity={0.8}>
                  <Text className="text-ink font-semibold text-sm" numberOfLines={1}>{item.title || "Cuộc trò chuyện mới"}</Text>
                  <Text className="text-ink-muted text-xs mt-0.5">{new Date(item.updated_at).toLocaleString("vi-VN")}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-3" onPress={() => confirmDelete(item)} accessibilityLabel="Xoá hội thoại">
                  <Feather name="trash-2" size={17} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
