import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { StyleSheet } from "react-native";

import { Palette } from "@/constants/theme";
import type { Place } from "@/types/place";

const INITIAL_CAMERA = {
  latitude: 37.548668,
  longitude: 127.046869,
  zoom: 15,
};

// 핀은 크기·상태 무관 동일 규칙 — 하나의 애셋을 모든 장소에 쓴다.
// 베이스 애셋은 "검정 본체 + 흰 점"이고, 런타임에 tintColor로 착색한다.
// (이 SDK의 tintColor는 가산 혼합이라 검정 본체가 정확히 tint색이 되고 흰 픽셀은 유지된다.)
// 색을 바꾸려면 PIN_TINT만, 모양을 바꾸려면 파일만 교체.
const PIN = require("@/assets/images/pin.png");

const PIN_TINT = Palette.main[500];

const PIN_WIDTH = 33;
const PIN_HEIGHT = 42;

export type PlaceMapProps = {
  places: Place[];
  onSelectPlace: (place: Place) => void;
};

export default function PlaceMap({ places, onSelectPlace }: PlaceMapProps) {
  return (
    <NaverMapView
      style={styles.map}
      initialCamera={INITIAL_CAMERA}
      isShowLocationButton={false}
    >
      {places.map((place) => (
        <NaverMapMarkerOverlay
          key={place.id}
          latitude={place.latitude}
          longitude={place.longitude}
          image={PIN}
          tintColor={PIN_TINT}
          width={PIN_WIDTH}
          height={PIN_HEIGHT}
          anchor={{ x: 0.5, y: 1 }}
          onTap={() => onSelectPlace(place)}
        />
      ))}
    </NaverMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
