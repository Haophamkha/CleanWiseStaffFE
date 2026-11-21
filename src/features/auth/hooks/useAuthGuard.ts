import { ALLOWED_APP_ROLE, ROUTES, STORAGE_KEYS } from "@/config/constants";
import { useLazyGetWorkerProfileQuery } from "@/features/auth/api/authApi";
import { clearAuth, setUser } from "@/features/auth/stores/authSlice";
import type { UserResponse } from "@/features/auth/types/authResponse";
import { usePushNotifications } from "@/features/notification/hooks/usePushNotifications";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { storage } from "@/utils/storage";
import { useRouter, useSegments } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

const valid = (token: string | null) => !!token && token !== "null" && token !== "undefined";

export function useAuthGuard() {
  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();
  const { status } = useAppSelector((state) => state.auth);
  const [getProfile] = useLazyGetWorkerProfileQuery();
  const [phase, setPhase] = useState<"loading" | "success" | "routing" | "ready" | "error">("loading");
  const attempt = useRef(0);

  const retry = useCallback(async () => {
    const current = ++attempt.current;
    setPhase("loading");
    try {
      const tokens = await Promise.all([
        storage.getItem(STORAGE_KEYS.ACCESS_TOKEN), storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
      if (!tokens.some(valid)) {
        dispatch(clearAuth());
        if (current === attempt.current) setPhase("ready");
        return;
      }
      // The worker API verifies the session/role. Do not erase a session merely
      // because an older JWT lacks a role claim or only a refresh token remains.
      const profile = await getProfile().unwrap();
      if (current !== attempt.current) return;
      if (profile.role && profile.role !== ALLOWED_APP_ROLE) {
        await storage.clearSession();
        dispatch(clearAuth());
        setPhase("ready");
        return;
      }
      await storage.persistSession();
      if (current !== attempt.current) return;
      dispatch(setUser({
        id: profile.user_id, username: profile.username, email: profile.email,
        phone_number: profile.phone_number, first_name: profile.first_name,
        last_name: profile.last_name, gender: profile.gender, birth_date: profile.birth_date,
        avatar: profile.portrait, role: profile.role || ALLOWED_APP_ROLE,
        is_active: true, date_joined: profile.created_at,
      } as UserResponse));
      setPhase("success");
    } catch {
      if (current !== attempt.current) return;
      try {
        const tokens = await Promise.all([
          storage.getItem(STORAGE_KEYS.ACCESS_TOKEN), storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        ]);
        if (current !== attempt.current) return;
        if (!tokens.some(valid)) {
          dispatch(clearAuth());
          setPhase("ready");
        } else setPhase("error");
      } catch { if (current === attempt.current) setPhase("error"); }
    }
  }, [dispatch, getProfile]);

  useEffect(() => {
    void retry();
    return () => { attempt.current += 1; };
  }, [retry]);

  useEffect(() => {
    if (phase === "routing" && segments[0] !== "(auth)") {
      setPhase("ready");
      return;
    }
    if (phase !== "ready" || status === "idle") return;
    const inAuthGroup = segments[0] === "(auth)";
    const isRoot = (segments as string[]).length === 0;
    if (status !== "authenticated" && !inAuthGroup && !isRoot) router.replace("/(auth)/login");
    else if (status === "authenticated" && inAuthGroup) router.replace("/(tabs)/home");
  }, [phase, status, segments, router]);

  usePushNotifications(phase === "ready" && status === "authenticated");
  const finish = useCallback(() => {
    if (phase !== "success") return;
    if (status === "authenticated" && segments[0] === "(auth)") {
      setPhase("routing");
      router.replace(ROUTES.HOME);
    } else setPhase("ready");
  }, [phase, status, segments, router]);
  return { ready: phase === "ready", phase, retry, finish };
}
