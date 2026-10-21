import * as Location from "expo-location";
import { useEffect, useState } from "react";

type Point = { latitude: number; longitude: number };

function haversineKm(a: Point, b: Point): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Khoảng cách (km) từ vị trí hiện tại đến destination. null nếu chưa có quyền/vị trí. */
export function useDistanceToAddress(destination: Point | null): number | null {
  const [km, setKm] = useState<number | null>(null);
  const lat = destination?.latitude;
  const lng = destination?.longitude;

  useEffect(() => {
    if (lat == null || lng == null) {
      setKm(null);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));
        if (cancelled || !pos) return;

        setKm(
          haversineKm(
            { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            { latitude: lat, longitude: lng },
          ),
        );
      } catch {
        // Không lấy được vị trí thì bỏ qua, không hiện dòng khoảng cách.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return km;
}
