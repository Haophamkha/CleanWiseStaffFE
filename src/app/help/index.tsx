import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { useGetHelpArticlesQuery } from "@/features/chatbot/api/chatbotApi";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpIndex() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useGetHelpArticlesQuery();
  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center" accessibilityLabel={tr("Quay lại")}>
          <Feather name="arrow-left" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="text-ink text-lg font-extrabold ml-1">{tr("Hướng dẫn")}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : isError ? (
        <TouchableOpacity onPress={() => refetch()} className="items-center mt-10">
          <Text className="text-ink-soft">{tr("Không tải được. Chạm để thử lại.")}</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: "/help/[id]", params: { id: String(item.id) } })}
              className="bg-surface border border-line rounded-2xl px-4 py-3.5" activeOpacity={0.8}>
              <Text className="text-ink font-bold text-sm">{item.title}</Text>
              <Text className="text-ink-soft text-xs mt-1" numberOfLines={2}>{item.summary}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
