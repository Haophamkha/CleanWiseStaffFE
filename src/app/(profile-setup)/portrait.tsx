import { ImageUploadBox } from "@/features/profile-setup/components/ImageUploadBox";
import {
  AdminNote,
  GuideCard,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { View } from "react-native";

const TIPS = [
  { ok: true, text: "Chụp chính diện, nhìn thẳng vào camera, rõ khuôn mặt." },
  { ok: true, text: "Ánh sáng tốt, không bị sấp bóng hoặc ngược sáng." },
  { ok: true, text: "Nền đơn giản, trang phục gọn gàng, lịch sự." },
  { ok: false, text: "Không đeo kính râm, khẩu trang hoặc mũ." },
  {
    ok: false,
    text: "Không dùng ảnh đã chỉnh sửa hoặc ảnh chụp lại từ màn hình.",
  },
];

export default function PortraitStep() {
  const s = useProfileSetup();
  const rejectionNote = s.note("portrait");

  return (
    <SetupScreen
      setup={s}
      step="portrait"
      title="Ảnh chân dung"
      subtitle="Ảnh này được dùng cho hồ sơ nhân viên của bạn."
    >
      {rejectionNote ? <AdminNote message={rejectionNote} /> : null}

      <View className="items-center py-4">
        <ImageUploadBox
          label="Thêm ảnh chân dung"
          sheetTitle="Ảnh chân dung"
          value={s.draft.portrait}
          onChange={(file) => s.update({ portrait: file })}
          shape="circle"
          frontCamera
          existingUri={s.existing.portrait}
        />
      </View>

      <GuideCard title="Hướng dẫn chụp ảnh" tips={TIPS} />
    </SetupScreen>
  );
}
