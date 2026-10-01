import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";

export type LatLng = { latitude: number; longitude: number };

export type RouteInfo = {
  coords: [number, number][];
  distanceLabel: string;
  durationLabel: string;
  isEstimate: boolean;
};

type PermissionState = "idle" | "granted" | "denied" | "blocked";

function haversine(a: LatLng, b: LatLng) {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function formatMinutes(seconds: number) {
  const total = Math.max(1, Math.round(seconds / 60));
  if (total < 60) return `${total} phút`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

// Đổi nhà cung cấp định tuyến: chỉ cần sửa hàm này.
async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteInfo> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json();
    const r = json?.routes?.[0];
    if (json?.code === "Ok" && r?.geometry?.coordinates?.length) {
      return {
        coords: r.geometry.coordinates,
        distanceLabel: formatDistance(r.distance),
        durationLabel: formatMinutes(r.duration),
        isEstimate: false,
      };
    }
  } catch {
    // rơi xuống đường chim bay
  } finally {
    clearTimeout(timer);
  }

  return {
    coords: [
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ],
    distanceLabel: formatDistance(haversine(from, to)),
    durationLabel: "",
    isEstimate: true,
  };
}

export function useJobRoute(destination: LatLng | null) {
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [user, setUser] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const locate = useCallback(async () => {
    if (!destination) return;
    const id = ++requestId.current;
    setIsLocating(true);
    setError(null);

    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted" && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== "granted") {
        if (id === requestId.current) {
          setPermission(perm.canAskAgain ? "denied" : "blocked");
        }
        return;
      }
      if (id === requestId.current) setPermission("granted");

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const me: LatLng = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      if (id !== requestId.current) return;
      setUser(me);

      const result = await fetchRoute(me, destination);
      if (id !== requestId.current) return;
      setRoute(result);
    } catch {
      if (id === requestId.current) {
        setError("Không xác định được vị trí. Hãy bật GPS rồi thử lại.");
      }
    } finally {
      if (id === requestId.current) setIsLocating(false);
    }
  }, [destination]);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  return {
    permission,
    user,
    route,
    isLocating,
    error,
    locate,
    openSettings: () => Linking.openSettings().catch(() => {}),
  };
}
