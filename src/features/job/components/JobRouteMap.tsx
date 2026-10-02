import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, ON_DARK, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import {
  RouteMapWebView,
  type RouteMapHandle,
} from "@/features/job/components/RouteMapWebView";
import { useJobRoute, type LatLng } from "@/features/job/hooks/useJobRoute";
import { Feather } from "@expo/vector-icons";
import { useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const MAP_HEIGHT = 240;

type JobRouteMapProps = {
  destination: LatLng;
  /** Mở Google Maps để dẫn đường từng bước */
  onOpenMaps: () => void;
};

export function JobRouteMap({ destination, onOpenMaps }: JobRouteMapProps) {
  const mapRef = useRef<RouteMapHandle>(null);
  const r = useJobRoute(destination);
  const blocked = r.permission === "blocked";

  return (
    <View className="mt-3 mb-1">
      <View
        className="border border-line overflow-hidden bg-canvas"
        style={[
          { height: MAP_HEIGHT, borderRadius: RADIUS.card },
          SHADOWS.card,
        ]}
      >
        <RouteMapWebView
          ref={mapRef}
          destination={destination}
          user={r.user}
          routeCoords={r.route?.coords ?? null}
        />

        {r.isLocating ? (
          <View
            pointerEvents="none"
            className="absolute top-3 left-3 flex-row items-center bg-surface rounded-full px-3 py-2"
            style={SHADOWS.card}
          >
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="text-ink text-xs font-semibold ml-2">
              Đang định vị...
            </Text>
          </View>
        ) : null}

        <PressableScale
          onPress={() => mapRef.current?.recenter()}
          accessibilityRole="button"
          accessibilityLabel="Căn bản đồ vừa khung"
          containerStyle={{ position: "absolute", top: 12, right: 12 }}
          className="w-11 h-11 rounded-full bg-surface items-center justify-center"
          style={SHADOWS.card}
        >
          <Feather name="crosshair" size={20} color={COLORS.ink} />
        </PressableScale>
      </View>

      <View className="flex-row items-center mt-3">
        {r.route ? (
          <>
            <View className="flex-1 mr-3">
              <Text className="text-ink-muted text-xs">
                {r.route.isEstimate
                  ? "Đường chim bay từ vị trí của bạn"
                  : "Từ vị trí của bạn"}
              </Text>
              <Text
                className="text-ink text-xl font-extrabold"
                numberOfLines={1}
              >
                {r.route.distanceLabel}
              </Text>
              <Text className="text-ink-soft text-xs" numberOfLines={1}>
                {r.route.isEstimate
                  ? "Chưa lấy được lộ trình, hãy dùng Google Maps"
                  : `khoảng ${r.route.durationLabel}`}
              </Text>
            </View>

            <PressableScale
              onPress={r.locate}
              disabled={r.isLocating}
              accessibilityRole="button"
              accessibilityLabel="Định vị lại"
              containerStyle={{ marginRight: 8 }}
              className="w-11 h-11 rounded-full bg-accent-light items-center justify-center"
              style={{ opacity: r.isLocating ? 0.5 : 1 }}
            >
              <Feather name="refresh-cw" size={18} color={COLORS.ink} />
            </PressableScale>

            <PressableScale
              onPress={onOpenMaps}
              accessibilityRole="button"
              accessibilityLabel="Mở Google Maps"
              className="flex-row items-center justify-center bg-ink rounded-full px-5"
              style={{ height: 44 }}
            >
              <Feather name="navigation" size={15} color={ON_DARK.text} />
              <Text className="text-white text-xs ml-2" style={TYPE.button}>
                CHỈ ĐƯỜNG
              </Text>
            </PressableScale>
          </>
        ) : (
          <>
            <View className="flex-1 mr-3">
              <Text className="text-ink text-sm font-extrabold">
                {blocked ? "Cần quyền vị trí" : "Xem đường đi tới nhà khách"}
              </Text>
              <Text className="text-ink-muted text-xs mt-0.5" numberOfLines={2}>
                {r.error ??
                  (blocked
                    ? "Hãy bật quyền vị trí cho ứng dụng trong Cài đặt."
                    : "Cho phép định vị để vẽ đường ngắn nhất.")}
              </Text>
            </View>

            <PressableScale
              onPress={blocked ? r.openSettings : r.locate}
              disabled={r.isLocating}
              accessibilityRole="button"
              className="flex-row items-center justify-center bg-ink rounded-full px-5"
              style={{ height: 44, opacity: r.isLocating ? 0.6 : 1 }}
            >
              {r.isLocating ? (
                <ActivityIndicator size="small" color={ON_DARK.text} />
              ) : (
                <Feather
                  name={blocked ? "settings" : "map-pin"}
                  size={15}
                  color={ON_DARK.text}
                />
              )}
              <Text className="text-white text-xs ml-2" style={TYPE.button}>
                {blocked ? "CÀI ĐẶT" : "XEM ĐƯỜNG"}
              </Text>
            </PressableScale>
          </>
        )}
      </View>
    </View>
  );
}
