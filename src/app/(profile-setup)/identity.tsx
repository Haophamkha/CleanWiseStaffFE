import { ImageUploadBox } from "@/features/profile-setup/components/ImageUploadBox";
import {
  Field,
  GuideCard,
  SectionLabel,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { Text, View } from "react-native";

const TIPS = [
  {
    ok: true,
    text: "Đặt giấy tờ trên mặt phẳng, nền tối màu, chụp thẳng góc.",
  },
  { ok: true, text: "Thấy rõ đủ 4 góc, chữ và số sắc nét." },
  { ok: true, text: "Chụp ở nơi đủ sáng, tránh bóng tay che." },
  { ok: false, text: "Không chụp bị lóa sáng, mờ hoặc cắt mất góc." },
  {
    ok: false,
    text: "Không dùng ảnh photo, ảnh đã chỉnh sửa hoặc giấy tờ hết hạn.",
  },
];

export default function IdentityStep() {
  const s = useProfileSetup();
  const frontNote = s.note("identity_front");
  const backNote = s.note("identity_back");

  return (
    <SetupScreen
      setup={s}
      step="identity"
      title="Xác thực danh tính"
      subtitle="Cung cấp thông tin chính xác để hoàn tất xác thực."
    >
      <Field
        label="Số CCCD / CMND"
        icon="credit-card"
        placeholder="Nhập số CCCD/CMND"
        keyboardType="number-pad"
        maxLength={12}
        value={s.identityNumber}
        locked={s.locked("identity_number")}
        note={s.note("identity_number")}
        onChangeText={(t) =>
          s.update({ identityNumber: t.replace(/[^0-9]/g, "") })
        }
      />

      <SectionLabel
        title="Ảnh chụp CCCD/CMND"
        hint={`Chụp trực tiếp hoặc tải ảnh lên cho cả 2 mặt.${
          s.hasImageRejection ? " Khi sửa ảnh, bạn cần tải lại cả 2 mặt." : ""
        }`}
      />

      <View style={{ gap: 16 }}>
        <View>
          <Text className="text-ink-soft text-xs font-bold mb-2">
            MẶT TRƯỚC
          </Text>
          <ImageUploadBox
            label="Mặt trước CCCD/CMND"
            sheetTitle="Mặt trước CCCD/CMND"
            shape="card"
            value={s.draft.identityFront}
            onChange={(file) => s.update({ identityFront: file })}
            existingUri={s.existing.identityFront}
            disabled={s.imagesLocked}
          />
          {frontNote ? (
            <Text className="text-danger text-xs mt-1.5">{frontNote}</Text>
          ) : null}
        </View>
        <View>
          <Text className="text-ink-soft text-xs font-bold mb-2">MẶT SAU</Text>
          <ImageUploadBox
            label="Mặt sau CCCD/CMND"
            sheetTitle="Mặt sau CCCD/CMND"
            shape="card"
            value={s.draft.identityBack}
            onChange={(file) => s.update({ identityBack: file })}
            existingUri={s.existing.identityBack}
            disabled={s.imagesLocked}
          />
          {backNote ? (
            <Text className="text-danger text-xs mt-1.5">{backNote}</Text>
          ) : null}
        </View>
      </View>

      <GuideCard title="Hướng dẫn chụp giấy tờ" tips={TIPS} />
    </SetupScreen>
  );
}
