import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-[92%] bg-white rounded-2xl border border-[#E5E7EB] px-4 py-3.5 flex-row items-start">
      <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3 mt-0.5">
        <Feather name="check" size={16} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-[#111827] font-semibold text-[15px]">
          {text1}
        </Text>
        {!!text2 && (
          <Text className="text-[#6B7280] text-[13px] mt-0.5">{text2}</Text>
        )}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="w-[92%] bg-white rounded-2xl border border-[#FCA5A5] px-4 py-3.5 flex-row items-start">
      <View className="w-8 h-8 rounded-full bg-[#FEE2E2] items-center justify-center mr-3 mt-0.5">
        <Feather name="alert-circle" size={16} color="#DC2626" />
      </View>
      <View className="flex-1">
        <Text className="text-[#111827] font-semibold text-[15px]">
          {text1}
        </Text>
        {!!text2 && (
          <Text className="text-[#6B7280] text-[13px] mt-0.5">{text2}</Text>
        )}
      </View>
    </View>
  ),
};
