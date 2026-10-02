import { COLORS, RADIUS } from "@/constants/theme";
import type { BankCatalogItem } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  banks: BankCatalogItem[];
  onClose: () => void;
  onSelect: (bank: BankCatalogItem) => void;
};

export default function BankPickerModal({
  visible,
  banks,
  onClose,
  onSelect,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const filteredBanks = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi");
    if (!query) return banks;
    return banks.filter((bank) =>
      `${bank.short_name} ${bank.name} ${bank.code}`
        .toLocaleLowerCase("vi")
        .includes(query),
    );
  }, [banks, keyword]);

  const close = () => {
    setKeyword("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView className="flex-1 bg-canvas">
        <View className="flex-row items-center px-3 pt-2 pb-2">
          <TouchableOpacity
            onPress={close}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            <Feather name="x" size={24} color={COLORS.ink} />
          </TouchableOpacity>
          <Text className="flex-1 text-ink text-[22px] font-extrabold ml-1">
            Chọn ngân hàng
          </Text>
        </View>

        <View
          className="mx-5 mt-2 mb-2 flex-row items-center bg-surface border border-line px-4"
          style={{ height: 48, borderRadius: RADIUS.pill }}
        >
          <Feather name="search" size={17} color={COLORS.inkMuted} />
          <TextInput
            className="flex-1 ml-3 text-ink text-[15px]"
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm theo tên ngân hàng"
            placeholderTextColor={COLORS.inkMuted}
            autoCapitalize="none"
          />
          {keyword.length > 0 && (
            <TouchableOpacity
              onPress={() => setKeyword("")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Xóa từ khóa tìm kiếm"
            >
              <Feather name="x" size={17} color={COLORS.inkMuted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredBanks}
          keyExtractor={(item) => `${item.bin}-${item.code}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center py-3.5 border-b border-line"
              style={{ minHeight: 64 }}
              onPress={() => {
                setKeyword("");
                onSelect(item);
              }}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-xl bg-surface border border-line items-center justify-center overflow-hidden mr-3">
                {item.logo ? (
                  <Image
                    source={{ uri: item.logo }}
                    style={{ width: 34, height: 34 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Feather name="briefcase" size={19} color={COLORS.ink} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-ink font-extrabold">
                  {item.short_name}
                </Text>
                <Text
                  className="text-ink-soft text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
              <Feather name="chevron-right" size={19} color={COLORS.inkMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Feather name="search" size={34} color={COLORS.inkMuted} />
              <Text className="text-ink-muted mt-3">
                Không tìm thấy ngân hàng
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
