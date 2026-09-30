import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, OVERLAY, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Modal, ScrollView, Text, View } from "react-native";

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
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: OVERLAY }}
      >
        <View
          className="bg-surface p-6 w-full items-center"
          style={[{ maxWidth: 360, borderRadius: RADIUS.hero }, SHADOWS.card]}
        >
          <View className="w-16 h-16 rounded-full bg-success-light items-center justify-center mb-4">
            <Feather name="check" size={30} color={COLORS.success} />
          </View>

          <Text className="text-ink text-xl font-extrabold text-center mb-1">
            {title}
          </Text>

          {message ? (
            <Text className="text-ink-soft text-sm text-center">{message}</Text>
          ) : null}

          {details && details.length > 0 ? (
            <ScrollView
              style={{ maxHeight: 140, width: "100%" }}
              className="bg-warning-light rounded-xl mt-3"
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
                    color={COLORS.warningDark}
                    style={{ marginTop: 2 }}
                  />
                  <Text className="text-warning-dark text-xs ml-1.5 flex-1">
                    {line}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <PrimaryButton
            label={confirmLabel}
            variant="dark"
            onPress={onClose}
            style={{ width: "100%", marginTop: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
}
