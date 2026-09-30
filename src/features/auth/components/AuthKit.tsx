import { COLORS, SHADOWS, TYPE } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthBackdrop } from "./AuthBackdrop";

type FeatherName = ComponentProps<typeof Feather>["name"];

type AuthScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6" style={{ paddingTop: insets.top + 20 }}>
          {/* Thương hiệu */}
          <View className="flex-row items-center">
            <View
              className="bg-primary items-center justify-center"
              style={[
                { width: 40, height: 40, borderRadius: 20 },
                SHADOWS.float,
              ]}
            >
              <Feather name="briefcase" size={18} color={COLORS.white} />
            </View>
            <View className="ml-3">
              <Text
                className="text-ink text-base font-extrabold"
                style={{ letterSpacing: 0.2 }}
              >
                CleanWise Staff
              </Text>
              <Text className="text-ink-muted text-xs">
                Ứng dụng dành cho nhân viên
              </Text>
            </View>
          </View>

          {/* Tiêu đề */}
          <Text
            className="text-ink text-[32px] font-extrabold mt-10"
            style={{ lineHeight: 38 }}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text className="text-ink-soft text-base leading-6 mt-2">
              {subtitle}
            </Text>
          )}

          <View className="mt-8">{children}</View>

          {!!footer && <View className="items-center mt-6">{footer}</View>}
        </View>

        <View className="flex-1 justify-end" style={{ paddingTop: 32 }}>
          <AuthBackdrop />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* Các mảnh UI dùng lại                                                */
/* ------------------------------------------------------------------ */

export function FormField({
  label,
  required,
  right,
  children,
}: {
  label: string;
  required?: boolean;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink text-[13px]" style={TYPE.label}>
          {label}
          {required ? <Text className="text-primary"> *</Text> : null}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View className="flex-row items-start bg-danger-light rounded-2xl p-3.5 mb-4">
      <Feather
        name="alert-circle"
        size={16}
        color={COLORS.danger}
        style={{ marginTop: 2 }}
      />
      <Text className="flex-1 text-danger text-sm leading-5 ml-2.5">
        {message}
      </Text>
    </View>
  );
}

export function SectionTitle({
  icon,
  title,
}: {
  icon: FeatherName;
  title: string;
}) {
  return (
    <View className="flex-row items-center mt-2 mb-4">
      <View className="w-8 h-8 rounded-full bg-accent-light items-center justify-center mr-2.5">
        <Feather name={icon} size={15} color={COLORS.ink} />
      </View>
      <Text className="text-ink text-[15px] font-extrabold">{title}</Text>
      <View className="flex-1 h-px bg-line ml-3" />
    </View>
  );
}

export function LinkText({
  children,
  strong,
  large,
}: {
  children: ReactNode;
  strong?: boolean;
  large?: boolean;
}) {
  return (
    <Text
      className={`text-primary ${large ? "text-base" : "text-[15px]"} ${
        strong ? "font-extrabold" : "font-bold"
      }`}
    >
      {children}
    </Text>
  );
}

/* Dòng chuyển trang ở cuối: "Chưa có tài khoản? Đăng ký" */
export function AuthFooter({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: ComponentProps<typeof Link>["href"];
}) {
  return (
    <View className="flex-row items-center py-2">
      <Text className="text-ink-soft text-base">{prompt} </Text>
      <Link href={href}>
        <LinkText strong large>
          {linkLabel}
        </LinkText>
      </Link>
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row bg-accent-light border border-line rounded-full p-1">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-1 items-center justify-center rounded-full ${
              selected ? "bg-ink" : "bg-transparent"
            }`}
            style={{ height: 44 }}
          >
            <Text
              className={`text-[13px] ${
                selected ? "text-white" : "text-ink-soft"
              }`}
              style={TYPE.label}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DateField({
  value,
  placeholder,
  onPress,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-accent-light rounded-2xl px-4 py-3.5"
      style={{ borderWidth: 1.5, borderColor: COLORS.line }}
    >
      <Feather name="calendar" size={17} color={COLORS.inkMuted} />
      <Text
        className={`flex-1 ml-3 text-[15px] ${
          value ? "text-ink" : "text-ink-muted"
        }`}
      >
        {value || placeholder}
      </Text>
      <Feather name="chevron-down" size={17} color={COLORS.inkMuted} />
    </Pressable>
  );
}

export function TermsCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-start mb-5"
    >
      <View
        className={`items-center justify-center rounded-md mr-3 ${
          checked ? "bg-ink" : "bg-surface"
        }`}
        style={{
          width: 22,
          height: 22,
          marginTop: 1,
          borderWidth: 1.5,
          borderColor: checked ? COLORS.ink : COLORS.inkMuted,
        }}
      >
        {checked && <Feather name="check" size={14} color={COLORS.white} />}
      </View>
      <Text className="flex-1 text-ink-soft text-[14px] leading-5">
        Tôi đã đọc và đồng ý với{" "}
        <Text className="text-primary font-bold">Điều khoản dịch vụ</Text> và{" "}
        <Text className="text-primary font-bold">Chính sách bảo mật</Text> của
        CleanWise.
      </Text>
    </Pressable>
  );
}

export function StepProgress({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) {
  return (
    <View className="mb-6">
      <View className="flex-row" style={{ gap: 6 }}>
        {labels.map((l, i) => (
          <View
            key={l}
            className={`flex-1 h-1.5 rounded-full ${
              i <= current ? "bg-ink" : "bg-accent-light"
            }`}
          />
        ))}
      </View>
      <View className="flex-row mt-2" style={{ gap: 6 }}>
        {labels.map((l, i) => (
          <Text
            key={l}
            className={`flex-1 text-[11px] ${
              i === current ? "text-ink font-bold" : "text-ink-muted"
            }`}
            numberOfLines={1}
          >
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
