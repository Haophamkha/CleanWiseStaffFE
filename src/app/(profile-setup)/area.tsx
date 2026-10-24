import { useTranslation } from "react-i18next";

import {
  AreaSelectorList,
  AreaSelectorTop,
} from "@/features/profile-setup/components/AreaSelector";
import { SetupScreen } from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";

export default function AreaStep() {
  const { t: tr } = useTranslation();

  const s = useProfileSetup();

  return (
    <SetupScreen
      setup={s}
      step="area"
      title={tr("Khu vực hoạt động")}
      subtitle={tr("Chọn 1 tỉnh/thành, sau đó chọn các phường/xã bạn có thể nhận việc.")}
      disabled={s.areaIds.length === 0}
      top={<AreaSelectorTop area={s.area} />}
    >
      <AreaSelectorList area={s.area} />
    </SetupScreen>
  );
}
