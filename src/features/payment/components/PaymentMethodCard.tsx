import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ON_DARK, RADIUS, TYPE } from "@/constants/theme";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  method: PaymentMethod;
  disabled: boolean;
  onSetDefault: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onVerify: (method: PaymentMethod) => void;
};

export default function PaymentMethodCard({
  method,
  disabled,
  onSetDefault,
  onDelete,
  onVerify,
}: Props) {
  const { t: tr } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const fullyVerified = method.verification_status === "VERIFIED";
  const okShown = fullyVerified || method.verification_status === "SANDBOX_VERIFIED";
  const failed = method.verification_status === "FAILED";
  const pending = method.verification_status === "PENDING";
  const statusLabel = okShown
    ? tr("\u0110\u00e3 x\u00e1c minh")
    : failed
      ? tr("X\u00e1c minh th\u1ea5t b\u1ea1i")
      : pending
        ? tr("\u0110ang x\u00e1c minh")
        : tr("Ch\u01b0a x\u00e1c minh");
  const dot = okShown ? COLORS.success : failed ? COLORS.danger : COLORS.warning;

  return (
    <View
      className="bg-surface border border-line mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View style={{ borderRadius: RADIUS.card, overflow: "hidden" }}>
        <View
          style={{
            backgroundColor: COLORS.inkPanel,
            padding: 20,
            overflow: "hidden",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -50,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: ON_DARK.surface,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -60,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: ON_DARK.surface,
              opacity: 0.6,
            }}
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-2">
              <View
                className="items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: ON_DARK.surface,
                }}
              >
                <Feather name="credit-card" size={18} color={ON_DARK.text} />
              </View>
              <Text
                className="text-base font-extrabold ml-3 flex-1"
                style={{ color: ON_DARK.text }}
                numberOfLines={1}
              >
                {method.display_name || method.bank_name}
              </Text>
            </View>
            {method.is_default && (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: ON_DARK.text }}
              >
                <Text
                  className="text-[11px]"
                  style={[TYPE.label, { color: COLORS.inkPanel }]}
                >
                  {tr("M\u1eb7c \u0111\u1ecbnh")}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              color: ON_DARK.text,
              fontSize: 20,
              fontWeight: "800",
              letterSpacing: 2,
              marginTop: 22,
            }}
            numberOfLines={1}
          >
            {method.account_number_masked}
          </Text>

          <View className="flex-row items-center justify-between mt-4">
            <Text
              className="text-sm flex-1 pr-3"
              style={{ color: ON_DARK.textSoft }}
              numberOfLines={1}
            >
              {method.account_holder_name}
            </Text>
            <View
              className="flex-row items-center rounded-full px-2.5 py-1"
              style={{ backgroundColor: ON_DARK.surface }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: dot,
                  marginRight: 6,
                }}
              />
              <Text
                className="text-[11px]"
                style={[TYPE.label, { color: ON_DARK.text }]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row bg-surface" style={{ paddingHorizontal: 4 }}>
          {!fullyVerified && (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center"
              style={{ minHeight: 48 }}
              onPress={() => onVerify(method)}
              disabled={disabled}
            >
              <Feather
                name={pending ? "refresh-cw" : "shield"}
                size={16}
                color={COLORS.ink}
              />
              <Text className="text-ink ml-2 text-[13px]" style={TYPE.label}>
                {tr("Ti\u1ebfp t\u1ee5c x\u00e1c minh")}
              </Text>
            </TouchableOpacity>
          )}
          {!method.is_default && (
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center ${
                !fullyVerified ? "border-l border-line" : ""
              }`}
              style={{ minHeight: 48 }}
              onPress={() => onSetDefault(method)}
              disabled={disabled}
            >
              <Feather name="check-circle" size={16} color={COLORS.ink} />
              <Text className="text-ink ml-2 text-[13px]" style={TYPE.label}>
                {tr("\u0110\u1eb7t m\u1eb7c \u0111\u1ecbnh")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className={`${
              method.is_default && fullyVerified ? "flex-1" : "flex-1 border-l border-line"
            } flex-row items-center justify-center`}
            style={{ minHeight: 48 }}
            onPress={() => onDelete(method)}
            disabled={disabled}
          >
            <Feather name="trash-2" size={16} color={COLORS.danger} />
            <Text className="text-danger ml-2 text-[13px]" style={TYPE.label}>
              {tr("X\u00f3a")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}