import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS } from "@/constants/theme";
import { StepHeader } from "@/features/profile-setup/components/StepHeader";
import {
  STEP_NUMBER,
  type ProfileSetup,
  type SetupStep,
} from "@/features/profile-setup/hooks/useProfileSetup";
import { Feather } from "@expo/vector-icons";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherName = ComponentProps<typeof Feather>["name"];

const TOTAL_STEPS = 5;

/** Khung chung cho mọi bước: header, tiêu đề, nội dung cuộn, nút ở đáy. */
export function SetupScreen({
  setup,
  step,
  title,
  subtitle,
  top,
  disabled,
  children,
}: {
  setup: ProfileSetup;
  step: SetupStep;
  title: string;
  subtitle: string;
  /** Khối cố định phía trên danh sách (ví dụ ô tìm kiếm). */
  top?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const number = STEP_NUMBER[step];

  return (
    <KeyboardAvoidingView className="flex-1 bg-canvas" behavior="padding">
      <StepHeader step={number} totalSteps={TOTAL_STEPS} />

      <View className="px-5 pt-3 pb-3">
        <Text
          className="text-ink-muted text-xs font-semibold"
          style={{ letterSpacing: 1.2 }}
        >
          BƯỚC {number}/{TOTAL_STEPS}
        </Text>
        <Text className="text-ink text-2xl font-extrabold mt-1">{title}</Text>
        <Text className="text-ink-soft text-sm leading-5 mt-1.5">
          {subtitle}
        </Text>
        {top ? <View className="mt-4">{top}</View> : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <View
        className="bg-surface border-t border-line px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {setup.error ? (
          <View className="flex-row items-center bg-danger-light rounded-2xl px-3.5 py-2.5 mb-3">
            <Feather name="alert-circle" size={16} color={COLORS.danger} />
            <Text className="text-danger text-sm ml-2 flex-1">
              {setup.error}
            </Text>
          </View>
        ) : null}
        <PrimaryButton
          label={setup.ctaLabel(step)}
          variant={setup.isFinalStep(step) ? "primary" : "dark"}
          loading={setup.isBusy}
          loadingLabel="Đang xử lý..."
          disabled={setup.isBusy || disabled}
          onPress={() => setup.goNext(step)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/** Ô nhập có nhãn, icon, ghi chú lỗi từ admin và trạng thái khóa. */
export function Field({
  label,
  note,
  locked,
  icon,
  suffix,
  ...input
}: {
  label: string;
  note?: string | null;
  locked?: boolean;
  icon?: FeatherName;
  suffix?: string;
} & TextInputProps) {
  const multiline = !!input.multiline;
  return (
    <View className="mb-4">
      <Text className="text-ink text-sm font-semibold mb-2">{label}</Text>
      <View
        className={`flex-row border rounded-2xl px-4 ${
          multiline ? "items-start py-3" : "items-center"
        } ${
          locked
            ? "bg-accent-light border-line"
            : note
              ? "bg-surface border-danger"
              : "bg-surface border-line"
        }`}
        style={{ minHeight: 52 }}
      >
        {icon ? (
          <Feather name={icon} size={17} color={COLORS.inkMuted} />
        ) : null}
        <TextInput
          {...input}
          editable={!locked}
          placeholderTextColor={COLORS.inkMuted}
          className={`flex-1 text-[15px] ${icon ? "ml-3" : ""} ${
            locked ? "text-ink-muted" : "text-ink"
          }`}
          style={
            multiline ? { minHeight: 90, textAlignVertical: "top" } : undefined
          }
        />
        {suffix ? (
          <Text className="text-ink-muted text-sm ml-2">{suffix}</Text>
        ) : null}
        {locked ? (
          <Feather
            name="lock"
            size={15}
            color={COLORS.inkMuted}
            style={{ marginLeft: 8 }}
          />
        ) : null}
      </View>
      {note ? <Text className="text-danger text-xs mt-1.5">{note}</Text> : null}
    </View>
  );
}

export function SectionLabel({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <View className="mb-3">
      <Text className="text-ink text-sm font-semibold">{title}</Text>
      {hint ? (
        <Text className="text-ink-muted text-xs mt-1 leading-4">{hint}</Text>
      ) : null}
    </View>
  );
}

export function AdminNote({ message }: { message: string }) {
  return (
    <View className="flex-row items-start bg-danger-light rounded-2xl px-4 py-3 mb-5">
      <Feather
        name="alert-circle"
        size={16}
        color={COLORS.danger}
        style={{ marginTop: 1 }}
      />
      <View className="flex-1 ml-2.5">
        <Text className="text-danger text-xs font-bold mb-0.5">
          Quản trị viên yêu cầu sửa lại
        </Text>
        <Text className="text-danger text-sm">{message}</Text>
      </View>
    </View>
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View
      className="flex-row items-center bg-surface border border-line rounded-2xl px-4"
      style={{ height: 48 }}
    >
      <Feather name="search" size={17} color={COLORS.inkMuted} />
      <TextInput
        className="flex-1 ml-3 text-ink text-[15px]"
        placeholder={placeholder}
        placeholderTextColor={COLORS.inkMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText("")} hitSlop={8}>
          <Feather name="x" size={17} color={COLORS.inkMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Choice({
  selected,
  onPress,
  title,
  subtitle,
  left,
  style,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  left?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center bg-surface rounded-2xl px-3.5 py-3 border-[1.5px] ${
        selected ? "border-ink" : "border-line"
      }`}
      style={[{ minHeight: 56 }, style]}
    >
      {left}
      <View className="flex-1">
        <Text
          className={`text-[15px] text-ink ${
            selected ? "font-extrabold" : "font-semibold"
          }`}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-ink-muted text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View className="w-5 h-5 rounded-full bg-ink items-center justify-center ml-2">
          <Feather name="check" size={12} color={COLORS.white} />
        </View>
      ) : (
        <View className="w-5 h-5 rounded-full border-[1.5px] border-line ml-2" />
      )}
    </TouchableOpacity>
  );
}

/** Khối hướng dẫn chụp ảnh: bấm để xổ xuống / thu gọn. */
export function GuideCard({
  title,
  tips,
  defaultOpen = false,
}: {
  title: string;
  tips: { ok: boolean; text: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View className="bg-surface border border-line rounded-3xl mt-5 overflow-hidden">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        className="flex-row items-center px-5"
        style={{ minHeight: 56 }}
      >
        <View className="w-8 h-8 rounded-full bg-accent-light items-center justify-center">
          <Feather name="info" size={15} color={COLORS.ink} />
        </View>
        <Text className="text-ink font-extrabold text-base ml-2.5 flex-1">
          {title}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.inkMuted}
        />
      </TouchableOpacity>

      {open ? (
        <View className="px-5 pb-4 pt-1 border-t border-line">
          <View className="pt-3">
            {tips.map((tip) => (
              <View key={tip.text} className="flex-row items-start mb-2.5">
                <Feather
                  name={tip.ok ? "check-circle" : "x-circle"}
                  size={16}
                  color={tip.ok ? COLORS.success : COLORS.danger}
                  style={{ marginTop: 2 }}
                />
                <Text className="text-ink-soft text-sm ml-2.5 flex-1 leading-5">
                  {tip.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
