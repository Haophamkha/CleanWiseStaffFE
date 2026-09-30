import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type FormInputProps = TextInputProps & {
  icon?: React.ComponentProps<typeof Feather>["name"];
  isPassword?: boolean;
  /** Khóa ô nhập: nền nhạt, chữ mờ, hiện ổ khóa */
  locked?: boolean;
};

export function FormInput({
  icon,
  isPassword,
  locked,
  onFocus,
  onBlur,
  style,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = focused && !locked;

  return (
    <View
      className={`flex-row rounded-2xl px-4 py-3.5 ${
        props.multiline ? "items-start" : "items-center"
      }`}
      style={{
        backgroundColor: locked
          ? COLORS.canvas
          : active
            ? COLORS.white
            : COLORS.accentLight,
        borderWidth: 1.5,
        borderColor: active ? COLORS.ink : COLORS.line,
      }}
    >
      {!!icon && (
        <Feather
          name={icon}
          size={17}
          color={active ? COLORS.primary : COLORS.inkMuted}
          style={props.multiline ? { marginTop: 2 } : undefined}
        />
      )}

      <TextInput
        className={`flex-1 text-[15px] ${icon ? "ml-3" : ""} ${
          locked ? "text-ink-muted" : "text-ink"
        }`}
        placeholderTextColor={COLORS.inkMuted}
        secureTextEntry={isPassword && !showPassword}
        {...props}
        editable={locked ? false : props.editable}
        style={[
          props.multiline
            ? { minHeight: 90, textAlignVertical: "top", paddingTop: 0 }
            : null,
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />

      {locked && (
        <Feather
          name="lock"
          size={15}
          color={COLORS.inkMuted}
          style={{ marginLeft: 8 }}
        />
      )}

      {isPassword && !locked && (
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={17}
            color={COLORS.inkMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
