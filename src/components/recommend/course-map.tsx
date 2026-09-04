import {
  NaverMapMarkerOverlay,
  NaverMapPolylineOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette } from "@/constants/theme";
import type { Coordinate, CourseWaypoint, NearbyPlace } from "@/types/course";

/**
 * 코스 결과 지도(S-11) — 경로 폴리라인 + 순번 핀 + 인근 장소 핀.
 *
 * 순번 핀은 최대 4개뿐이라(지도 홈의 60핀 성능 이슈와 무관) 커스텀 뷰 마커로
 * 번호를 그린다. walkPath가 없으면(경로 API 실패) 지점 좌표를 직선으로 잇는다.
 * 인근 장소(nearby) 핀은 메인 지도와 동일한 핀 애셋을 쓴다(순번 핀은 번호 원형이라 구분됨).
 */
export type CourseMapProps = {
  waypoints: CourseWaypoint[];
  walkPath: Coordinate[] | null;
  onSelectWaypoint: (placeId: string) => void;
  nearby?: NearbyPlace[];
  onSelectNearby?: (place: NearbyPlace) => void;
};

const PATH_COLOR = Palette.main[500];
const PATH_WIDTH = 5;
const MARKER_SIZE = 30;

// 인근 장소 핀 — 메인 지도(place-map)와 동일한 애셋·색·크기.
const NEARBY_PIN = require("@/assets/images/pin.png");

const NEARBY_PIN_TINT = Palette.main[500];
const NEARBY_PIN_WIDTH = 33;
const NEARBY_PIN_HEIGHT = 42;

// 좌표가 하나도 없을 때 카메라 폴백(서울 시청 근방). boundsCamera(빈 배열)의 NaN 크래시를 막는다.
const DEFAULT_CAMERA = { latitude: 37.5665, longitude: 126.978, zoom: 12 };

function boundsCamera(points: Coordinate[]) {
  if (points.length === 0) {
    return DEFAULT_CAMERA;
  }
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const span = Math.max(latSpan, lngSpan, 0.005);
  // 대략적인 span→zoom 매핑(정밀 fit 대신 화면 개발용 근사).
  const zoom = Math.min(
    16,
    Math.max(12, Math.round(14.5 - Math.log2(span / 0.01))),
  );
  return {
    latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
    longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
    zoom,
  };
}

export default function CourseMap({
  waypoints,
  walkPath,
  onSelectWaypoint,
  nearby = [],
  onSelectNearby,
}: CourseMapProps) {
  const pathCoords: Coordinate[] =
    walkPath ??
    waypoints.map((w) => ({ latitude: w.latitude, longitude: w.longitude }));

  return (
    <NaverMapView
      style={styles.map}
      initialCamera={boundsCamera(pathCoords)}
      isShowLocationButton={false}
    >
      {nearby.map((place, index) => (
        <NaverMapMarkerOverlay
          key={`nearby-${index}`}
          latitude={place.latitude}
          longitude={place.longitude}
          image={NEARBY_PIN}
          tintColor={NEARBY_PIN_TINT}
          width={NEARBY_PIN_WIDTH}
          height={NEARBY_PIN_HEIGHT}
          anchor={{ x: 0.5, y: 1 }}
          onTap={onSelectNearby ? () => onSelectNearby(place) : undefined}
        />
      ))}

      {pathCoords.length > 1 ? (
        <NaverMapPolylineOverlay
          coords={pathCoords}
          color={PATH_COLOR}
          width={PATH_WIDTH}
        />
      ) : null}

      {waypoints.map((waypoint, index) => (
        <NaverMapMarkerOverlay
          key={`${waypoint.placeId}-${index}`}
          latitude={waypoint.latitude}
          longitude={waypoint.longitude}
          anchor={{ x: 0.5, y: 0.5 }}
          width={MARKER_SIZE}
          height={MARKER_SIZE}
          onTap={() => onSelectWaypoint(waypoint.placeId)}
        >
          <View
            key={`waypoint-${index}`}
            collapsable={false}
            style={styles.marker}
          >
            <ThemedText type="subtitle04" color={Palette.white}>
              {index + 1}
            </ThemedText>
          </View>
        </NaverMapMarkerOverlay>
      ))}
    </NaverMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.main[500],
    borderWidth: 2,
    borderColor: Palette.white,
  },
});
