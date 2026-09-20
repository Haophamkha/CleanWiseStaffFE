import { ALLOWED_APP_ROLE, STORAGE_KEYS } from "@/config/constants";
import { clearAuth, setAuthStatus } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decodeJwtPayload } from "@/utils/jwt";
import { storage } from "@/utils/storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export function useAuthGuard() {
  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();
  const { user, status } = useAppSelector((s) => s.auth);

  // 1. Lúc app khởi động: đọc token từ storage 1 lần duy nhất.
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const isValid = !!token && token !== "undefined" && token !== "null";

        if (!isValid) {
          dispatch(setAuthStatus("unauthenticated"));
          return;
        }

        // Token có thể là token của app khác (vd app khách hàng) còn sót lại
        // trên cùng thiết bị. Role được BE nhúng sẵn vào claim của access
        // token lúc login (xem build_token_response ở BE), nên đọc thẳng từ
        // đó để biết token này có đúng thuộc app hiện tại không — không cần
        // gọi thêm API nào, và cũng không cần đợi tới lúc gọi API rồi mới
        // dính 403.
        const payload = decodeJwtPayload(token);
        const tokenRole = payload?.role;

        if (!payload || tokenRole !== ALLOWED_APP_ROLE) {
          await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
          await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
          dispatch(clearAuth()); // reducer này tự set status = "unauthenticated"
          return;
        }

        // Có token hợp lệ đúng role nhưng Redux chưa có user (vừa F5 lại
        // trang web, hoặc vừa mở app lại từ storage).
        // TODO: nếu có endpoint /api/auth/me hoặc /worker/profile, gọi ở
        // đây để lấy lại thông tin user thật thay vì để user = null.
        dispatch(setAuthStatus("authenticated"));
      } catch {
        dispatch(setAuthStatus("unauthenticated"));
      }
    })();
    // Chỉ chạy 1 lần lúc app mount, không phụ thuộc user/status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Mỗi khi status hoặc route thay đổi: quyết định có redirect không.
  useEffect(() => {
    if (status === "idle") return; // chưa check xong, chưa quyết định gì

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isAuthenticated = status === "authenticated";

    if (!isAuthenticated && inTabsGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [status, segments, router]);

  return { ready: status !== "idle" };
}
