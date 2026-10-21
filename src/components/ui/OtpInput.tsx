import { COLORS } from "@/constants/theme";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
};

/**
 * Ô nhập OTP dạng các ô oval bo tròn.
 * Bên dưới là 1 TextInput thật (trong suốt, phủ kín) nên dán mã / autofill SMS vẫn hoạt động.
 */
export function OtpInput({ value, onChange, length = 6, invalid }: Props) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const isActive = focused && i === activeIndex;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 60,
                marginRight: i === length - 1 ? 0 : 8,
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.surface,
                borderWidth: 1.5,
                borderColor: invalid
                  ? COLORS.danger
                  : isActive
                    ? COLORS.primary
                    : char
                      ? COLORS.primaryBorder
                      : COLORS.line,
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: COLORS.ink }}
              >
                {char ?? ""}
              </Text>
            </View>
          );
        })}
      </View>

      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.01,
          color: "transparent",
        }}
      />
    </View>
  );
}
