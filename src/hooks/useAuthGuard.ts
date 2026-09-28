import { ALLOWED_APP_ROLE, STORAGE_KEYS } from "@/config/constants";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useGetWorkerProfileQuery } from "@/services/authApi";
import { clearAuth, setAuthStatus, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { UserResponse } from "@/types/Response";
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

        // Token có thể là của app khách còn sót lại trên cùng thiết bị.
        // Role nằm sẵn trong claim của access token.
        const payload = decodeJwtPayload(token);
        if (!payload || payload.role !== ALLOWED_APP_ROLE) {
          await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
          await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
          dispatch(clearAuth());
          return;
        }

        // Access token hết hạn cũng không sao: request đầu tiên nhận 401 sẽ
        // được refresh tự động.
        dispatch(setAuthStatus("authenticated"));
      } catch {
        dispatch(setAuthStatus("unauthenticated"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Mở lại app: có token nhưng Redux chưa có user -> nạp từ hồ sơ.
  //    (Đăng nhập xong thì login.tsx đã setUser nên query này bị skip.)
  const { data: profile } = useGetWorkerProfileQuery(undefined, {
    skip: status !== "authenticated" || !!user,
  });

  useEffect(() => {
    if (status === "authenticated" && !user && profile) {
      // Chỉnh field cho khớp type UserResponse của bạn nếu khác
      dispatch(
        setUser({
          id: profile.user_id,
          username: profile.username,
          email: profile.email,
          phone_number: profile.phone_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          gender: profile.gender,
          birth_date: profile.birth_date,
          avatar: profile.portrait,
          role: profile.role,
          is_active: true,
          date_joined: profile.created_at,
        } as unknown as UserResponse),
      );
    }
  }, [status, user, profile, dispatch]);

  // 3. Mỗi khi status hoặc route thay đổi: quyết định có redirect không.
  useEffect(() => {
    if (status === "idle") return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isAuthenticated = status === "authenticated";

    if (!isAuthenticated && inTabsGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [status, segments, router]);

  usePushNotifications(status === "authenticated");

  return { ready: status !== "idle" };
}
