import { ImageUploadBox } from "@/features/profile-setup/components/ImageUploadBox";
import {
  Field,
  GuideCard,
  SectionLabel,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { Text } from "react-native";

const TIPS = [
  { ok: true, text: "Chụp toàn bộ giấy, thấy rõ tên, con dấu và ngày cấp." },
  { ok: true, text: "Đặt giấy trên mặt phẳng, đủ sáng, chụp thẳng góc." },
  { ok: false, text: "Không chụp mờ, lóa sáng hoặc bị cắt mất góc." },
  {
    ok: false,
    text: "Không dùng giấy tờ đã hết hạn hoặc không liên quan dịch vụ.",
  },
];

export default function ExperienceStep() {
  const s = useProfileSetup();
  const certificateNote = s.note("certificate_file");

  return (
    <SetupScreen
      setup={s}
      step="experience"
      title="Kinh nghiệm & chứng chỉ"
      subtitle="Thông tin này giúp khách hàng tin tưởng và lựa chọn bạn."
    >
      <Field
        label="Giới thiệu bản thân"
        placeholder="Ví dụ: Tôi có kinh nghiệm dọn dẹp nhà cửa, cẩn thận và đúng giờ..."
        multiline
        value={s.bio}
        locked={s.locked("bio")}
        note={s.note("bio")}
        onChangeText={(t) => s.update({ bio: t })}
      />

      <Field
        label="Số năm kinh nghiệm"
        icon="clock"
        placeholder="Ví dụ: 2"
        keyboardType="number-pad"
        maxLength={2}
        suffix="năm"
        value={s.experienceYears}
        locked={s.locked("experience_years")}
        note={s.note("experience_years")}
        onChangeText={(t) =>
          s.update({ experienceYears: t.replace(/[^0-9]/g, "") })
        }
      />

      <SectionLabel
        title="Chứng chỉ / giấy phép / bằng cấp"
        hint="Chụp trực tiếp hoặc tải ảnh chứng chỉ, giấy phép, giấy khen hay bằng cấp liên quan đến dịch vụ."
      />
      <ImageUploadBox
        label="Thêm chứng chỉ / giấy phép"
        sheetTitle="Chứng chỉ / giấy phép"
        shape="wide"
        value={s.draft.certificate}
        onChange={(file) => s.update({ certificate: file })}
        existingUri={s.existing.certificate}
        disabled={s.locked("certificate_file")}
      />
      {certificateNote ? (
        <Text className="text-danger text-xs mt-1.5">{certificateNote}</Text>
      ) : null}

      <GuideCard title="Hướng dẫn chụp giấy tờ" tips={TIPS} />
    </SetupScreen>
  );
}
