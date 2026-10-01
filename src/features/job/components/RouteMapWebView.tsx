import { COLORS } from "@/constants/theme";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

// "liberty": nhiều màu, chi tiết | "positron": trắng xám tối giản | "bright": sáng
const MAP_STYLE = "liberty";

export type RouteMapHandle = { recenter: () => void };

type LatLng = { latitude: number; longitude: number };

type RouteMapWebViewProps = {
  destination: LatLng;
  user: LatLng | null;
  routeCoords: [number, number][] | null;
};

function buildHtml(dest: LatLng) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script>
      function post(m) {
        try { window.ReactNativeWebView.postMessage(String(m)); } catch (e) {}
      }
      window.onerror = function (msg, src, line) {
        post('JS_ERR: ' + msg + ' @' + line);
      };
      post('HTML_START');
    </script>
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
      onerror="post('CDN_FAIL: maplibre css')" />
    <style>
      html, body, #map {
        height: 100%; margin: 0; padding: 0;
        background-color: ${COLORS.canvas};
        -webkit-tap-highlight-color: transparent;
      }
      .maplibregl-ctrl-attrib { font-size: 8px !important; opacity: 0.6; }
      .pin { filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }
      .me-wrap { position: relative; width: 22px; height: 22px; }
      .me-pulse {
        position: absolute; inset: -14px; border-radius: 50%;
        background: ${COLORS.info}; opacity: 0.25;
        animation: pulse 2s ease-out infinite;
      }
      .me-dot {
        position: absolute; inset: 3px; border-radius: 50%;
        background: ${COLORS.info};
        border: 3px solid ${COLORS.white};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      @keyframes pulse {
        0%   { transform: scale(0.5); opacity: 0.5; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"
      onerror="post('CDN_FAIL: maplibre js (unpkg bi chan?)')"></script>
    <script>
      post('SCRIPT_RUN, maplibregl=' + (typeof maplibregl));

      const DEST = [${dest.longitude}, ${dest.latitude}];
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/${MAP_STYLE}',
        center: DEST,
        zoom: 15,
        minZoom: 3,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      map.on('error', function (e) {
        post('MAP_ERR: ' + (e && e.error && e.error.message));
      });
      setTimeout(function () {
        if (!ready) post('MAP_NOT_LOADED_after_8s');
      }, 8000);

      // Ghim nhà khách
      const pin = document.createElement('div');
      pin.className = 'pin';
      pin.innerHTML =
        '<svg width="34" height="44" viewBox="0 0 24 32">' +
        '<path d="M12 0C5.4 0 0 5.2 0 11.6 0 20.4 12 32 12 32s12-11.6 12-20.4C24 5.2 18.6 0 12 0z" fill="${COLORS.primary}"/>' +
        '<circle cx="12" cy="11.5" r="4.5" fill="${COLORS.white}"/></svg>';
      new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat(DEST).addTo(map);

      let ready = false;
      let meMarker = null;
      let lastKey = '';
      const state = { user: null, route: null };

      function empty() { return { type: 'FeatureCollection', features: [] }; }
      function line(coords) {
        return { type: 'FeatureCollection', features: [
          { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
        ] };
      }

      window.fit = function () {
        if (!ready) return;
        if (!state.user && !state.route) {
          map.flyTo({ center: DEST, zoom: 16, duration: 800, essential: true });
          return;
        }
        const b = new maplibregl.LngLatBounds(DEST, DEST);
        if (state.route) state.route.forEach(function (c) { b.extend(c); });
        else b.extend([state.user.lng, state.user.lat]);
        map.fitBounds(b, {
          padding: { top: 70, bottom: 40, left: 50, right: 50 },
          maxZoom: 17, duration: 900, essential: true
        });
      };

      function render() {
        if (!ready) return;
        map.getSource('route').setData(state.route ? line(state.route) : empty());

        if (state.user) {
          if (meMarker) {
            meMarker.setLngLat([state.user.lng, state.user.lat]);
          } else {
            const el = document.createElement('div');
            el.className = 'me-wrap';
            el.innerHTML = '<div class="me-pulse"></div><div class="me-dot"></div>';
            meMarker = new maplibregl.Marker({ element: el })
              .setLngLat([state.user.lng, state.user.lat]).addTo(map);
          }
        }

        const key = state.user ? state.user.lat.toFixed(5) + ',' + state.user.lng.toFixed(5) : '';
        if (key && key !== lastKey) { lastKey = key; window.fit(); }
      }

      window.update = function (p) {
        post('UPDATE user=' + !!p.user + ' routePts=' + (p.route ? p.route.length : 0));
        state.user = p.user;
        state.route = p.route;
        render();
      };

      map.on('load', function () {
        post('MAP_LOADED');
        map.addSource('route', { type: 'geojson', data: empty() });
        map.addLayer({
          id: 'route-casing', type: 'line', source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '${COLORS.white}', 'line-width': 9 }
        });
        map.addLayer({
          id: 'route-line', type: 'line', source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '${COLORS.ink}', 'line-width': 5 }
        });
        ready = true;
        render();
      });
    </script>
  </body>
</html>`;
}

export const RouteMapWebView = forwardRef<RouteMapHandle, RouteMapWebViewProps>(
  function RouteMapWebView({ destination, user, routeCoords }, ref) {
    const webviewRef = useRef<WebView>(null);
    const loadedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      recenter: () => {
        webviewRef.current?.injectJavaScript(
          "window.fit && window.fit(); true;",
        );
      },
    }));

    const push = useCallback(() => {
      if (!loadedRef.current) return;
      const payload = {
        user: user ? { lat: user.latitude, lng: user.longitude } : null,
        route: routeCoords,
      };
      webviewRef.current?.injectJavaScript(
        `window.update && window.update(${JSON.stringify(payload)}); true;`,
      );
    }, [user, routeCoords]);

    useEffect(() => {
      push();
    }, [push]);

    const source = useMemo(
      () => ({
        baseUrl: "https://localhost",
        html: buildHtml(destination),
      }),
      // Ghim cố định theo địa chỉ đơn; vị trí/đường đi được đẩy vào sau
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [destination.latitude, destination.longitude],
    );

    return (
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={source}
        onLoadEnd={() => {
          console.log("WV_LOAD_END");
          loadedRef.current = true;
          push();
        }}
        onError={(e) => console.log("WV_ERROR", e.nativeEvent)}
        onHttpError={(e) =>
          console.log("WV_HTTP", e.nativeEvent.statusCode, e.nativeEvent.url)
        }
        onMessage={(e) => console.log("WV_MSG", e.nativeEvent.data)}
        style={{ flex: 1, backgroundColor: COLORS.canvas }}
        javaScriptEnabled
        domStorageEnabled
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        androidLayerType="hardware"
        startInLoadingState
        renderLoading={() => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.canvas,
              },
            ]}
          >
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}
      />
    );
  },
);
