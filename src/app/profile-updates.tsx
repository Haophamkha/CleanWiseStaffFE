import { useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  useGetWorkerProfileQuery,
  useUpdateWorkerProfileMutation,
} from "@/features/auth/api/authApi";
import { EmailChange } from "@/features/profile-setup/components/EmailChangeCard";
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

