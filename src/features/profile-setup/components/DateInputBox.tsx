import { COLORS } from "@/constants/theme";
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
  noMargin = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  /** Bỏ khoảng cách dưới mặc định (khi đã đặt trong Field có khoảng cách riêng) */
  noMargin?: boolean;
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
        className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
          noMargin ? "" : "mb-4"
        }`}
        style={{
          backgroundColor: disabled ? COLORS.canvas : COLORS.accentLight,
          borderWidth: 1.5,
          borderColor: COLORS.line,
        }}
        onPress={() => {
          if (!disabled) setShowPicker(true);
        }}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Feather name="calendar" size={17} color={COLORS.inkMuted} />
        <Text
          className="flex-1 ml-3 text-[15px]"
          style={{
            color: disabled
              ? COLORS.inkMuted
              : value
                ? COLORS.ink
                : COLORS.inkMuted,
          }}
        >
          {value || "Chọn ngày"}
        </Text>
        <Feather
          name={disabled ? "lock" : "chevron-down"}
          size={16}
          color={COLORS.inkMuted}
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
