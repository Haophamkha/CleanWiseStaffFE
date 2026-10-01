import {
  AreaSelectorList,
  AreaSelectorTop,
} from "@/features/profile-setup/components/AreaSelector";
import { SetupScreen } from "@/features/profile-setup/components/SetupKit";
import { useProfileSetup } from "@/features/profile-setup/hooks/useProfileSetup";

export default function AreaStep() {
  const s = useProfileSetup();

  return (
    <SetupScreen
      setup={s}
      step="area"
      title="Khu vực hoạt động"
      subtitle="Chọn 1 tỉnh/thành, sau đó chọn các phường/xã bạn có thể nhận việc."
      disabled={s.areaIds.length === 0}
      top={<AreaSelectorTop area={s.area} />}
    >
      <AreaSelectorList area={s.area} />
    </SetupScreen>
  );
}
