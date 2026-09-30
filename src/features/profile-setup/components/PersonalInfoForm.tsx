import { FormInput } from "@/components/ui/FormInput";
import { COLORS, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import { DateInputBox } from "@/features/profile-setup/components/DateInputBox";
import {
    GENDER_OPTIONS,
    type PersonalInfoState,
} from "@/features/profile-setup/hooks/usePersonalInfo";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-6">
      <Text
        className="text-ink-muted text-xs mb-2.5 ml-1"
        style={[TYPE.label, { letterSpacing: 1 }]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        className="bg-surface border border-line p-4"
        style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
      >
        {children}
      </View>
    </View>
  );
}

function Field({
  label,
  note,
  children,
  last,
}: {
  label: string;
  note?: string | null;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <View className={last ? "" : "mb-4"}>
      <Text className="text-ink text-[13px] mb-2" style={TYPE.label}>
        {label}
      </Text>
      {children}
      {!!note && (
        <View className="flex-row items-start mt-2">
          <Feather
            name="alert-circle"
            size={13}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-danger text-xs leading-4 ml-1.5">
            {note}
          </Text>
        </View>
      )}
    </View>
  );
}

export function PersonalInfoForm({ form }: { form: PersonalInfoState }) {
  const { values, locked, notes } = form;

  return (
    <View>
      <Card title="Thông tin cơ bản">
        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Field label="Họ" note={notes.lastName}>
              <FormInput
                placeholder="Nguyễn"
                value={values.lastName}
                onChangeText={form.setLastName}
                locked={locked.lastName}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Tên" note={notes.firstName}>
              <FormInput
                placeholder="Văn A"
                value={values.firstName}
                onChangeText={form.setFirstName}
                locked={locked.firstName}
              />
            </Field>
          </View>
        </View>

        <Field label="Số điện thoại" note={notes.phone}>
          <FormInput
            icon="phone"
            placeholder="09xxxxxxxx"
            keyboardType="phone-pad"
            value={values.phoneNumber}
            onChangeText={form.setPhoneNumber}
            locked={locked.phone}
          />
        </Field>

        <Field label="Giới tính" note={notes.gender}>
          <View
            className="flex-row bg-accent-light border border-line rounded-full p-1"
            style={{ opacity: locked.gender ? 0.5 : 1 }}
          >
            {GENDER_OPTIONS.map((opt) => {
              const selected = values.gender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => form.setGender(opt.value)}
                  disabled={locked.gender}
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
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Ngày sinh" note={notes.birthDate} last>
          <DateInputBox
            value={values.birthDate}
            onChange={form.setBirthDate}
            maxDate={form.maxBirthDate}
            disabled={locked.birth}
            noMargin
          />
        </Field>
      </Card>

      <Card title="Kinh nghiệm">
        <Field label="Số năm kinh nghiệm">
          <FormInput
            icon="briefcase"
            placeholder="0"
            keyboardType="number-pad"
            value={values.experienceYears}
            onChangeText={form.handleChangeYears}
            locked={locked.years}
          />
        </Field>

        <Field label="Giới thiệu bản thân" last>
          <FormInput
            placeholder="Mô tả kinh nghiệm, kỹ năng của bạn..."
            multiline
            numberOfLines={4}
            value={values.bio}
            onChangeText={form.setBio}
            locked={locked.bio}
          />
        </Field>
      </Card>

      {!!form.error && (
        <View className="flex-row items-start bg-danger-light rounded-2xl p-3.5 mt-5">
          <Feather
            name="alert-circle"
            size={16}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-danger text-sm leading-5 ml-2.5">
            {form.error}
          </Text>
        </View>
      )}
    </View>
  );
}
