import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Parse "YYYY-MM-DD" theo giờ local (tránh lệch ngày do new Date(string) hiểu là UTC)
const parseDate = (value: string, fallback: Date): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return fallback;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? fallback : date;
};

export function DateInputBox({
  value,
  onChange,
  maxDate = new Date(),
  minDate,
  disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? parseDate(value, maxDate) : maxDate;

  const handleChange = (event: any, selectedDate?: Date) => {
    // Trên Android, picker tự đóng sau khi chọn/huỷ — phải set false ở đây.
    // Trên iOS (spinner/inline), picker ở lại, đóng bằng nút riêng nếu cần.
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "dismissed") return;
    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
  };

  return (
    <View>
      <TouchableOpacity
        className={`flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 py-3.5 mb-4 ${
          disabled ? "bg-[#F3F4F6]" : "bg-white"
        }`}
        onPress={() => {
          if (!disabled) setShowPicker(true);
        }}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Feather name="calendar" size={17} color="#9CA3AF" />
        <Text
          className="flex-1 ml-3 text-[15px]"
          style={{
            color: disabled ? "#9CA3AF" : value ? "#111827" : "#9CA3AF",
          }}
        >
          {value || "Chọn ngày"}
        </Text>
        <Feather
          name={disabled ? "lock" : "chevron-down"}
          size={16}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {showPicker && !disabled && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maxDate}
          minimumDate={minDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
