import { useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  useConfirmWorkerEmailChangeMutation,
  useGetWorkerProfileQuery,
  useRequestWorkerEmailChangeMutation,
  useUpdateWorkerProfileMutation,
} from "@/features/auth/api/authApi";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import type { WorkerProfileResponse } from "@/features/profile-setup/types/WorkerProfile";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { getErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";

const inputClass = "rounded-xl border border-line bg-canvas px-3 py-2.5 text-ink";

function ErrorText({ error }: { error: string }) {
  return error ? <Text accessibilityLiveRegion="polite" className="text-sm text-danger">{error}</Text> : null;
}

function WorkInfo({ profile }: { profile: WorkerProfileResponse }) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [years, setYears] = useState(String(profile.experience_years));
  const [error, setError] = useState("");
  const [update, { isLoading }] = useUpdateWorkerProfileMutation();
  async function save() {
    if (!/^[0-9]+$/.test(years.trim()) || Number(years) > 2147483647) {
      setError(t("Nhập số năm kinh nghiệm hợp lệ."));
      return;
    }
    setError("");
    try {
      await update({ bio: bio.trim(), experience_years: Number(years) }).unwrap();
      showSuccessToast(t("Đã lưu thông tin."));
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <Text className="text-base font-bold text-ink">{t("Thông tin làm việc")}</Text>
      <Text className="text-sm font-semibold text-ink">{t("Giới thiệu")}</Text>
      <TextInput accessibilityLabel={t("Giới thiệu")} multiline value={bio} onChangeText={setBio} className={inputClass} placeholderTextColor={COLORS.inkMuted} />
      <Text className="text-sm font-semibold text-ink">{t("Số năm kinh nghiệm")}</Text>
      <TextInput accessibilityLabel={t("Số năm kinh nghiệm")} keyboardType="number-pad" value={years} onChangeText={setYears} className={inputClass} />
      <ErrorText error={error} />
      <PrimaryButton accessibilityRole="button" label={t("Lưu thông tin làm việc")} onPress={save} loading={isLoading} />
      <PrimaryButton accessibilityRole="button" label={t("Khu vực hoạt động")} variant="outline" onPress={() => router.push("/(profile-setup)/working-areas")} />
    </View>
  );
}

function EmailChange({ currentEmail }: { currentEmail: string }) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [request, sending] = useRequestWorkerEmailChangeMutation();
  const [confirm, confirming] = useConfirmWorkerEmailChangeMutation();
  const busy = sending.isLoading || confirming.isLoading;
  const credentials = { email: email.trim(), password };
  async function send() {
    setError("");
    try {
      await request(credentials).unwrap();
      setCode("");
      setSent(true);
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }
  async function verify() {
    setError("");
    try {
      await confirm({ ...credentials, code }).unwrap();
      setEmail("");
      setPassword("");
      setCode("");
      setSent(false);
      showSuccessToast(t("Đã xác minh và cập nhật email."));
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <Text className="text-base font-bold text-ink">{t("Đổi email")}</Text>
      <Text className="text-sm text-ink-soft">{t("Email hiện tại")} · {currentEmail}</Text>
      <Text className="text-sm font-semibold text-ink">{t("Email mới")}</Text>
      <TextInput accessibilityLabel={t("Email mới")} value={email} onChangeText={value => { setEmail(value); setSent(false); setCode(""); setError(""); }}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy} className={inputClass} />
      <Text className="text-sm font-semibold text-ink">{t("Mật khẩu hiện tại")}</Text>
      <TextInput accessibilityLabel={t("Mật khẩu hiện tại")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" editable={!busy} className={inputClass} />
      {sent && (
        <>
          <Text className="text-sm text-ink-soft">{t("Mã xác minh đã được gửi đến email mới.")}</Text>
          <TextInput accessibilityLabel={t("Mã xác minh")} value={code} onChangeText={value => setCode(value.replace(/[^0-9]/g, ""))} keyboardType="number-pad"
            autoComplete="one-time-code" maxLength={6} placeholder={t("Mã xác minh")} placeholderTextColor={COLORS.inkMuted} editable={!busy} className={inputClass} />
          <PrimaryButton accessibilityRole="button" label={t("Xác minh và đổi email")} onPress={verify} disabled={busy || code.length !== 6 || !password} loading={confirming.isLoading} />
        </>
      )}
      <ErrorText error={error} />
      <PrimaryButton accessibilityRole="button" label={t(sent ? "Gửi lại mã" : "Gửi mã xác minh")} variant={sent ? "outline" : "primary"}
        onPress={send} disabled={busy || !credentials.email || !password} loading={sending.isLoading} />
    </View>
  );
}

export default function ProfileUpdatesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const profile = useGetWorkerProfileQuery(undefined, { refetchOnMountOrArgChange: true });
  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader title={t("Cập nhật thông tin và tài khoản")} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 24 }}>
        {profile.data ? (
          <>
            <WorkInfo key={profile.data.id} profile={profile.data} />
            <EmailChange currentEmail={profile.data.email} />
          </>
        ) : profile.isError ? <PrimaryButton accessibilityRole="button" label={t("Thử lại")} onPress={() => void profile.refetch()} /> : <ActivityIndicator />}
      </ScrollView>
    </View>
  );
}
