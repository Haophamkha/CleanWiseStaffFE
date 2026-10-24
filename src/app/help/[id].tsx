import { useTranslation } from "react-i18next";
import { getLocale } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { useGetHelpArticleQuery } from "@/features/chatbot/api/chatbotApi";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpDetail() {
  const { t: tr } = useTranslation();

  const { COLORS } = useAppTheme();

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetHelpArticleQuery(Number(id), { skip: !Number(id) });
  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center" accessibilityLabel={tr("Quay lại")}>
          <Feather name="arrow-left" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="text-ink text-lg font-extrabold ml-1 flex-1" numberOfLines={1}>{data?.title ?? tr("Hướng dẫn")}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : isError || !data ? (
        <TouchableOpacity onPress={() => refetch()} className="items-center mt-10">
          <Text className="text-ink-soft">{tr("Không tải được bài hướng dẫn. Chạm để thử lại.")}</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
          <Text className="text-ink-muted text-xs mb-3">
            {tr("Phiên bản")}{" "}{data.version}  {tr("· Hiệu lực từ")} {new Date(data.effective_from).toLocaleDateString(getLocale())}
          </Text>
          {!!data.summary && <Text className="text-ink-soft text-sm leading-6 mb-4">{data.summary}</Text>}
          {data.sections.map((s, i) => (
            <View key={i} className="mb-4">
              <Text className="text-ink font-bold text-[15px] mb-1">{s.heading}</Text>
              <Text className="text-ink text-sm leading-6">{s.text}</Text>
            </View>
          ))}
          {!!data.source_document && <Text className="text-ink-muted text-xs mt-2">{tr("Nguồn:")} {data.source_document}</Text>}
        </ScrollView>
      )}
    </View>
  );
}
