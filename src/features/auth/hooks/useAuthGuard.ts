import { ALLOWED_APP_ROLE, STORAGE_KEYS } from "@/config/constants";
import { useGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import {
  clearAuth,
  setAuthStatus,
  setUser,
} from "@/features/auth/stores/authSlice";
import type { UserResponse } from "@/features/auth/types/authResponse";
import { decodeJwtPayload } from "@/features/auth/utils/jwt";
import { usePushNotifications } from "@/features/notification/hooks/usePushNotifications";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
  const { data: profile } = useGetWorkerProfileQuery(undefined, {
    skip: status !== "authenticated" || !!user,
  });

  useEffect(() => {
    if (status === "authenticated" && !user && profile) {
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
    const isRoot = (segments as string[]).length === 0; // index.tsx
    const isAuthenticated = status === "authenticated";

    if (!isAuthenticated && !inAuthGroup && !isRoot) {
      // Chặn cả (tabs), (profile-setup), earnings, jobs, payment-methods...
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [status, segments, router]);

  usePushNotifications(status === "authenticated");

  return { ready: status !== "idle" };
}
