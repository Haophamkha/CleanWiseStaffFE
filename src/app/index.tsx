import { Redirect } from "expo-router";

export default function Index() {
  // useAuthGuard ở root layout sẽ tự redirect đúng chỗ ngay khi ready.
  // Route này chỉ là điểm neo trung gian, mặc định thử vào tabs trước.
  return <Redirect href="/(tabs)/home" />;
}
