import { Redirect } from "expo-router";
import { useAppSelector } from "@/store/hooks";

export default function Index() {
  const status = useAppSelector((state) => state.auth.status);
  if (status === "idle") return null;
  // Go straight to login for signed-out users instead of opening home first.
  return <Redirect href={status === "authenticated" ? "/(tabs)/home" : "/(auth)/login"} />;
}
