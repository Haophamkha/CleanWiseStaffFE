import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { ImageUploadBox } from "@/features/profile-setup/components/ImageUploadBox";
import {
  Field,
  GuideCard,
  SectionLabel,
  SetupScreen,
} from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";
import { Text, View } from "react-native";

function getLocalizedTips() {
  return [
    {
      ok: true,
      text: tr("Đặt giấy tờ trên mặt phẳng, nền tối màu, chụp thẳng góc."),
    },
    { ok: true, text: tr("Thấy rõ đủ 4 góc, chữ và số sắc nét.") },
    { ok: true, text: tr("Chụp ở nơi đủ sáng, tránh bóng tay che.") },
    { ok: false, text: tr("Không chụp bị lóa sáng, mờ hoặc cắt mất góc.") },
    {
      ok: false,
      text: tr("Không dùng ảnh photo, ảnh đã chỉnh sửa hoặc giấy tờ hết hạn."),
    },
  ];
}

export default function IdentityStep() {
  const { t: tr } = useTranslation();

  const s = useProfileSetup();
  const frontNote = s.note("identity_front");
  const backNote = s.note("identity_back");

  return (
    <SetupScreen
      setup={s}
      step="identity"
      title={tr("Xác thực danh tính")}
      subtitle={tr("Cung cấp thông tin chính xác để hoàn tất xác thực.")}
    >
      <Field
        label={tr("Số CCCD / CMND")}
        icon="credit-card"
        placeholder={tr("Nhập số CCCD/CMND")}
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
        title={tr("Ảnh chụp CCCD/CMND")}
        hint={tr("Chụp trực tiếp hoặc tải ảnh lên cho cả 2 mặt.{{value0}}", { value0: s.hasImageRejection ? tr(" Khi sửa ảnh, bạn cần tải lại cả 2 mặt.") : "" })}
      />

      <View style={{ gap: 16 }}>
        <View>
          <Text className="text-ink-soft text-xs font-bold mb-2">
            {tr("MẶT TRƯỚC")}</Text>
          <ImageUploadBox
            label={tr("Mặt trước CCCD/CMND")}
            sheetTitle={tr("Mặt trước CCCD/CMND")}
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
          <Text className="text-ink-soft text-xs font-bold mb-2">{tr("MẶT SAU")}</Text>
          <ImageUploadBox
            label={tr("Mặt sau CCCD/CMND")}
            sheetTitle={tr("Mặt sau CCCD/CMND")}
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

      <GuideCard title={tr("Hướng dẫn chụp giấy tờ")} tips={getLocalizedTips()} />
    </SetupScreen>
  );
}
