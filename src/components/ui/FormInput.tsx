import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type FormInputProps = TextInputProps & {
  icon: React.ComponentProps<typeof Feather>["name"];
  isPassword?: boolean;
};

export function FormInput({ icon, isPassword, ...props }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-row items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-4 py-3.5">
      <Feather name={icon} size={17} color="#9CA3AF" />

      <TextInput
        className="flex-1 ml-3 text-[#111827] text-[15px]"
        placeholderTextColor="#9CA3AF"
        secureTextEntry={isPassword && !showPassword}
        {...props}
      />

      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={17}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
