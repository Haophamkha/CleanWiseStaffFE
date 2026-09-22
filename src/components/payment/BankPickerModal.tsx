import type { BankCatalogItem } from "@/types/PaymentMethod";
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

export default function BankPickerModal({ visible, banks, onClose, onSelect }: Props) {
  const [keyword, setKeyword] = useState("");
  const filteredBanks = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi");
    if (!query) return banks;
    return banks.filter((bank) =>
      `${bank.short_name} ${bank.name} ${bank.code}`.toLocaleLowerCase("vi").includes(query),
    );
  }, [banks, keyword]);

  const close = () => {
    setKeyword("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4 border-b border-[#F3F4F6]">
          <TouchableOpacity onPress={close} className="mr-4">
            <Feather name="x" size={23} color="#111827" />
          </TouchableOpacity>
          <Text className="text-[#111827] text-lg font-bold">Chọn ngân hàng</Text>
        </View>
        <View className="mx-5 mt-4 mb-2 flex-row items-center bg-[#F8F9FC] border border-[#E5E7EB] rounded-2xl px-4">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3.5 ml-3 text-[#111827]"
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm theo tên ngân hàng"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
        <FlatList
          data={filteredBanks}
          keyExtractor={(item) => `${item.bin}-${item.code}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-[#F3F4F6]"
              onPress={() => {
                setKeyword("");
                onSelect(item);
              }}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] items-center justify-center overflow-hidden mr-3">
                {item.logo ? (
                  <Image source={{ uri: item.logo }} style={{ width: 34, height: 34 }} resizeMode="contain" />
                ) : (
                  <Feather name="briefcase" size={19} color="#2563EB" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[#111827] font-semibold">{item.short_name}</Text>
                <Text className="text-[#6B7280] text-xs mt-1" numberOfLines={1}>{item.name}</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Feather name="search" size={34} color="#D1D5DB" />
              <Text className="text-[#9CA3AF] mt-3">Không tìm thấy ngân hàng</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
