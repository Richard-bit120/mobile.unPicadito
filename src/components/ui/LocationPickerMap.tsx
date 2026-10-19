import { ENV } from '@/config/env';
import { THEME } from '@/config/theme';
import { MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface CoordsXY {
    x: number; // Longitud
    y: number; // Latitud
}

interface LocationPickerProps {
    value?: CoordsXY;
    onChange?: (coords: CoordsXY) => void;
    initialLocation?: { latitude: number; longitude: number };
    onLocationSelect?: (coords: CoordsXY) => void;
    readOnly?: boolean;
    height?: number;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
    value,
    onChange,
    initialLocation,
    onLocationSelect,
    readOnly = false,
    height = 240,
}) => {
    const webViewRef = useRef<WebView>(null);

    const lat = Number(
        value?.y ?? initialLocation?.latitude ?? ENV.DEFAULT_COORDINATES.latitude
    );
    const lng = Number(
        value?.x ?? initialLocation?.longitude ?? ENV.DEFAULT_COORDINATES.longitude
    );

    const initialCoordRef = useRef({ lat, lng, readOnly });

    const leafletHtml = useMemo(() => {
        const initLat = initialCoordRef.current.lat;
        const initLng = initialCoordRef.current.lng;
        const isReadOnly = initialCoordRef.current.readOnly;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #111827;
    }
    .custom-pin {
      font-size: 30px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var readOnly = ${isReadOnly ? 'true' : 'false'};
    var map = L.map('map', { zoomControl: true }).setView([${initLat}, ${initLng}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    var pinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="custom-pin">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    var marker = L.marker([${initLat}, ${initLng}], {
      icon: pinIcon,
      draggable: !readOnly
    }).addTo(map);

    function emitCoords(lat, lng) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          x: Number(lng.toFixed(6)),
          y: Number(lat.toFixed(6))
        }));
      }
    }

    marker.on('dragend', function () {
      if (!readOnly) {
        var pos = marker.getLatLng();
        emitCoords(pos.lat, pos.lng);
      }
    });

    map.on('click', function (e) {
      if (!readOnly) {
        marker.setLatLng(e.latlng);
        emitCoords(e.latlng.lat, e.latlng.lng);
      }
    });

    window.updateMapState = function (newLat, newLng, newReadOnly) {
      readOnly = newReadOnly;
      if (marker.dragging) {
        if (readOnly) marker.dragging.disable();
        else marker.dragging.enable();
      }
      var cur = marker.getLatLng();
      if (Math.abs(cur.lat - newLat) > 0.00001 || Math.abs(cur.lng - newLng) > 0.00001) {
        marker.setLatLng([newLat, newLng]);
        map.setView([newLat, newLng], map.getZoom());
      }
    };
  </script>
</body>
</html>`;
    }, []);

    useEffect(() => {
        if (!isNaN(lat) && !isNaN(lng)) {
            webViewRef.current?.injectJavaScript(
                `window.updateMapState && window.updateMapState(${lat}, ${lng}, ${readOnly}); true;`
            );
        }
    }, [lat, lng, readOnly]);

    const handleMessage = (event: WebViewMessageEvent) => {
        if (readOnly) return;
        try {
            const coords = JSON.parse(event.nativeEvent.data);
            if (typeof coords?.x === 'number' && typeof coords?.y === 'number') {
                onChange?.(coords);
                onLocationSelect?.(coords);
            }
        } catch {
            // Ignorar mensajes que no sean JSON de coordenadas
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.labelRow}>
                <MapPin size={14} color={THEME.colors.primary} />
                <Text style={styles.instructions}>
                    {!readOnly
                        ? 'Tocá o arrastrá el pin hasta la cancha'
                        : 'Ubicación de la cancha'}
                </Text>
            </View>

            <View style={[styles.mapContainer, { height }]}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    style={styles.map}
                    onMessage={handleMessage}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>

            <Text style={styles.coordsText}>
                Coordenadas: Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: THEME.spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    instructions: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
        marginLeft: 6,
    },
    mapContainer: {
        borderRadius: THEME.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        backgroundColor: THEME.colors.surface,
    },
    map: {
        flex: 1,
        backgroundColor: THEME.colors.surface,
    },
    coordsText: {
        color: THEME.colors.textMuted,
        fontSize: 11,
        marginTop: 6,
    },
});