import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { StyleSheet } from 'react-native';

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

export default function MapScreen() {
  return <NaverMapView style={styles.map} initialCamera={INITIAL_CAMERA} />;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
