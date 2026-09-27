import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  loading: boolean;
  onCheckOut: (completionNote: string) => void;
};

export function CheckOutSection({ loading, onCheckOut }: Props) {
  const [visible, setVisible] = useState(false);
  const [completionNote, setCompletionNote] = useState("");

  const handleOpen = () => {
    if (loading) return;

    setCompletionNote("");
    setVisible(true);
  };

  const handleCancel = () => {
    if (loading) return;

    setVisible(false);
    setCompletionNote("");
  };

  const handleConfirm = () => {
    if (loading) return;

    const note = completionNote.trim();

    setVisible(false);
    onCheckOut(note);
  };

  return (
    <>
      <PrimaryButton
        label="Hoàn thành công việc"
        subtitle="Xác nhận đã làm xong buổi này"
        color="#15803D"
        loading={loading}
        loadingLabel="Đang xử lý..."
        icon="check-circle"
        onPress={handleOpen}
        disabled={loading}
        style={{ marginBottom: 12 }}
      />

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.backdrop} onPress={handleCancel} />

          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>✓</Text>
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>Hoàn thành buổi làm</Text>
                <Text style={styles.subtitle}>
                  Xác nhận bạn đã hoàn thành công việc
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>
                Ghi chú hoàn thành
                <Text style={styles.optional}> (không bắt buộc)</Text>
              </Text>

              <TextInput
                value={completionNote}
                onChangeText={setCompletionNote}
                placeholder="Ví dụ: Đã vệ sinh đầy đủ các khu vực theo yêu cầu..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                maxLength={1000}
                editable={!loading}
                style={styles.input}
              />

              <Text style={styles.counter}>{completionNote.length}/1000</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmButton,
                  loading && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.confirmText}>
                  {loading ? "Đang xử lý..." : "Hoàn thành"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modal: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#15803D",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  optional: {
    fontWeight: "400",
    color: "#9CA3AF",
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },

  counter: {
    marginTop: 6,
    textAlign: "right",
    fontSize: 12,
    color: "#9CA3AF",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#15803D",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.6,
  },

  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
