import { Feather } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message?: string;
  details?: string[];
  confirmLabel?: string;
  onClose: () => void;
}

export function SuccessModal({
  visible,
  title,
  message,
  details,
  confirmLabel = "Xong",
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/45 items-center justify-center px-8">
        <View
          className="bg-white rounded-3xl p-6 w-full items-center"
          style={{ maxWidth: 360 }}
        >
          <View className="w-16 h-16 rounded-full bg-[#DCFCE7] items-center justify-center mb-4">
            <Feather name="check" size={30} color="#15803D" />
          </View>

          <Text className="text-[#111827] text-lg font-bold text-center mb-1">
            {title}
          </Text>

          {message ? (
            <Text className="text-[#6B7280] text-sm text-center">
              {message}
            </Text>
          ) : null}

          {details && details.length > 0 ? (
            <ScrollView
              style={{ maxHeight: 140, width: "100%" }}
              className="bg-[#FEF3C7] rounded-xl mt-3"
              contentContainerStyle={{ padding: 12 }}
            >
              {details.map((line, i) => (
                <View
                  key={i}
                  className={`flex-row items-start ${
                    i === details.length - 1 ? "" : "mb-1.5"
                  }`}
                >
                  <Feather
                    name="alert-triangle"
                    size={12}
                    color="#B45309"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="text-[#92400E] text-xs ml-1.5 flex-1">
                    {line}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <Pressable
            onPress={onClose}
            className="bg-[#2563EB] rounded-xl py-3.5 px-8 w-full items-center mt-5"
          >
            <Text className="text-white font-semibold text-base">
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
