import {
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { StyleSheet } from "react-native";

import { MOCK_PLACES } from "@/mocks/places";

const INITIAL_CAMERA = {
  latitude: 37.5445,
  longitude: 127.0374,
  zoom: 15,
};

const DEMO_COURSE_COORDS = ["p-001", "p-002", "p-014", "p-006"]
  .map((id) => MOCK_PLACES.find((p) => p.id === id))
  .filter((p): p is (typeof MOCK_PLACES)[number] => p != null)
  .map(({ latitude, longitude }) => ({ latitude, longitude }));

export default function PlaceMap() {
  return (
    <NaverMapView style={styles.map} initialCamera={INITIAL_CAMERA}>
      {MOCK_PLACES.slice(0, 3).map((place) => (
        <NaverMapMarkerOverlay
          key={place.id}
          latitude={place.latitude}
          longitude={place.longitude}
          caption={{ text: place.name }}
        />
      ))}

      <NaverMapPathOverlay
        coords={DEMO_COURSE_COORDS}
        width={8}
        color="#2DB400"
        outlineWidth={1}
        outlineColor="#1B6E00"
      />
    </NaverMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
