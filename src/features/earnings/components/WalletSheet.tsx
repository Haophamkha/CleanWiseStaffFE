import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import type { ReactNode } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function WalletSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: OVERLAY,
            justifyContent: "flex-end",
          }}
          onPress={onClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: COLORS.surface,
                borderTopLeftRadius: RADIUS.sheet,
                borderTopRightRadius: RADIUS.sheet,
                paddingBottom: Math.max(insets.bottom, 16) + 16,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: COLORS.line,
                  }}
                />
              </View>
              <ScrollView
                style={{ maxHeight: 560 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingTop: 16,
                }}
              >
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AmountField({
  value,
  onChange,
  editable = true,
}: {
  value: string;
  onChange: (v: string) => void;
  editable?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: COLORS.canvas,
        borderWidth: 1,
        borderColor: COLORS.line,
        opacity: editable ? 1 : 0.6,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          marginRight: 8,
          color: COLORS.inkMuted,
        }}
      >
        đ
      </Text>
      <TextInput
        style={{
          flex: 1,
          paddingVertical: 16,
          fontSize: 20,
          fontWeight: "700",
          color: COLORS.ink,
        }}
        placeholder="0"
        placeholderTextColor={COLORS.inkMuted}
        keyboardType="number-pad"
        value={value}
        editable={editable}
        onChangeText={onChange}
      />
    </View>
  );
}

export function QuickAmounts({
  amounts,
  onPick,
  format,
  disabled,
}: {
  amounts: number[];
  onPick: (v: number) => void;
  format: (v: number) => string;
  disabled?: boolean;
}) {
  if (amounts.length === 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
      }}
    >
      {amounts.map((v) => (
        <TouchableOpacity
          key={v}
          disabled={disabled}
          onPress={() => onPick(v)}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: COLORS.primaryLight,
            borderWidth: 1,
            borderColor: COLORS.primaryBorder,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: COLORS.primaryDark,
            }}
          >
            {format(v)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SheetButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "soft";
}) {
  const primary = variant === "primary";
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      style={{
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: primary ? COLORS.primary : COLORS.primaryLight,
        opacity: inactive ? 0.55 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={primary ? COLORS.white : COLORS.primaryDark}
        />
      ) : (
        <Text
          style={{
            fontWeight: "700",
            fontSize: 16,
            color: primary ? COLORS.white : COLORS.primaryDark,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function ErrorBox({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <View
      style={{
        backgroundColor: COLORS.dangerLight,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: COLORS.danger, fontSize: 13, lineHeight: 19 }}>
        {text}
      </Text>
    </View>
  );
}
