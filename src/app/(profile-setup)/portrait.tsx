import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { ImageUploadBox } from "@/features/profile-setup/components/ImageUploadBox";
import {
  AdminNote,
  GuideCard,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { View } from "react-native";

function getLocalizedTips() {
  return [
    { ok: true, text: tr("Chụp chính diện, nhìn thẳng vào camera, rõ khuôn mặt.") },
    { ok: true, text: tr("Ánh sáng tốt, không bị sấp bóng hoặc ngược sáng.") },
    { ok: true, text: tr("Nền đơn giản, trang phục gọn gàng, lịch sự.") },
    { ok: false, text: tr("Không đeo kính râm, khẩu trang hoặc mũ.") },
    {
      ok: false,
      text: tr("Không dùng ảnh đã chỉnh sửa hoặc ảnh chụp lại từ màn hình."),
    },
  ];
}

export default function PortraitStep() {
  const { t: tr } = useTranslation();

  const s = useProfileSetup();
  const rejectionNote = s.note("portrait");

  return (
    <SetupScreen
      setup={s}
      step="portrait"
      title={tr("Ảnh chân dung")}
      subtitle={tr("Ảnh này được dùng cho hồ sơ nhân viên của bạn.")}
    >
      {rejectionNote ? <AdminNote message={rejectionNote} /> : null}

      <View className="items-center py-4">
        <ImageUploadBox
          label={tr("Thêm ảnh chân dung")}
          sheetTitle={tr("Ảnh chân dung")}
          value={s.draft.portrait}
          onChange={(file) => s.update({ portrait: file })}
          shape="circle"
          frontCamera
          existingUri={s.existing.portrait}
        />
      </View>

      <GuideCard title={tr("Hướng dẫn chụp ảnh")} tips={getLocalizedTips()} />
    </SetupScreen>
  );
}
