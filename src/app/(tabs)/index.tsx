import {
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { StyleSheet } from "react-native";

import { MOCK_PLACES } from "@/mocks/places";

/**
 * 지도 화면 (홈 탭).
 *
 * [RN 함정 1] NaverMapView는 웹의 <div>가 아니라 네이티브 뷰다.
 * 부모로부터 확정된 높이를 못 받으면 높이 0으로 렌더돼 "아무것도 안 뜨는" 상태가 된다.
 * CSS와 달리 height:100%가 없으므로 flex: 1 로 부모를 꽉 채워야 한다.
 *
 * [RN 함정 2] 여기서 SafeAreaView로 감싸면 상단/하단 인셋만큼 지도가 잘려서
 * 흰 띠가 생긴다. 지도는 화면 끝까지 그려지는 게 정상이고,
 * 안전 영역은 나중에 지도 "위에" 올라갈 UI에만 적용하면 된다.
 *
 * [RN 함정 3] StyleSheet.create로 만든 스타일은 리렌더마다 새 객체를 만들지 않는다.
 * style={{ flex: 1 }} 인라인 표기는 매 렌더 새 객체라 네이티브 쪽으로 불필요한
 * prop 업데이트가 건너간다. 지도처럼 무거운 뷰일수록 StyleSheet 쪽이 낫다.
 */

// 서울숲 근처
const INITIAL_CAMERA = {
  latitude: 37.5445,
  longitude: 127.0374,
  zoom: 15,
};

// [임시] 경로선 데모 데이터.
// 아직 Course(추천 코스) API도 목 데이터도 없어서, 목 장소 몇 곳을 이어
// 경로선 렌더만 확인하는 용도. 추천 코스 기능이 붙으면 Course.path로 교체할 것.
// (없는 코스 데이터를 지어내지 않도록 실제 MOCK_PLACES 좌표만 사용한다.)
const DEMO_COURSE_COORDS = ["p-001", "p-002", "p-014", "p-006"]
  .map((id) => MOCK_PLACES.find((p) => p.id === id))
  .filter((p): p is (typeof MOCK_PLACES)[number] => p != null)
  .map(({ latitude, longitude }) => ({ latitude, longitude }));

export default function MapScreen() {
  // [RN 함정] 마커/경로선은 NaverMapView의 자식으로 넣어야 지도 위에 그려진다.
  // 형제로 두거나 밖에 두면 렌더는 되지만 지도에 안 붙는다.
  return (
    <NaverMapView style={styles.map} initialCamera={INITIAL_CAMERA}>
      {/* 목 장소들을 마커로 렌더. 실제 API로 갈아탈 땐 MOCK_PLACES만 교체하면 된다.
          지금은 확인용으로 앞 3개만 표시한다. */}
      {MOCK_PLACES.slice(0, 3).map((place) => (
        <NaverMapMarkerOverlay
          key={place.id}
          latitude={place.latitude}
          longitude={place.longitude}
          caption={{ text: place.name }}
        />
      ))}

      {/* [임시] 데모 경로선. Course API 나오면 교체. */}
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
