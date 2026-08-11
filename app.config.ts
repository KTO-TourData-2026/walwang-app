import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * 네이티브(android/, ios/) 설정의 유일한 소스 오브 트루스.
 *
 * [RN 초보자용 주의사항]
 * android/ 폴더는 .gitignore 처리돼 있고 `expo prebuild`가 매번 새로 생성한다.
 * 즉 AndroidManifest.xml이나 build.gradle을 직접 고쳐도 --clean 한 번이면 전부 날아간다.
 * 네이티브 쪽에 뭔가 넣어야 하면 반드시 이 파일의 plugins 배열을 통해서 넣을 것.
 *
 * Expo CLI는 expo 명령 실행 시 .env를 자동으로 읽어 process.env에 넣어준다.
 * (dotenv를 직접 import 할 필요 없음)
 * 단, EXPO_PUBLIC_ 접두사가 붙은 값만 JS 번들에 포함된다.
 * NAVER_MAP_CLIENT_ID는 네이티브 빌드 시점에만 쓰이므로 접두사를 붙이지 않는다.
 */
const NAVER_MAP_CLIENT_ID = process.env.NAVER_MAP_CLIENT_ID;

if (!NAVER_MAP_CLIENT_ID) {
  // 값이 없으면 지도가 "빈 회색 화면"으로만 뜨고 에러는 안 난다.
  // 원인 파악이 매우 어려우므로 설정 단계에서 바로 터뜨린다.
  throw new Error(
    'NAVER_MAP_CLIENT_ID 가 없습니다. .env.example을 복사해 .env를 만들고 값을 채우세요.'
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'walwang',
  slug: 'walwang',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'walwang',
  userInterfaceStyle: 'automatic',

  // [New Architecture(Fabric) 관련 — 중요]
  // 여기에 newArchEnabled를 쓰지 말 것. SDK 57에서 이 키는 제거됐다.
  // - @expo/config-types의 ExpoConfig에 없어서 tsc가 에러를 낸다
  // - node_modules 어디에서도 읽지 않는다 (실측 확인)
  // - false로 넣고 prebuild를 돌려도 gradle.properties는 newArchEnabled=true 그대로다
  // expo-build-properties의 android.newArchEnabled도 SDK 57에서 삭제됐다.
  // RN 0.86 기준 구 아키텍처 자체가 없어져서 New Arch는 끌 수단이 아예 없다.
  // 즉 @mj-studio/react-native-naver-map 2.x의 New Arch 요구조건은 항상 충족된다.

  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    package: 'com.walwang.android',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    // AndroidManifest.xml에 네이버 지도 CLIENT_ID meta-data를 주입한다.
    ['@mj-studio/react-native-naver-map', { client_id: NAVER_MAP_CLIENT_ID }],
    // 네이버 지도 SDK는 mavenCentral에 없다.
    // 이 저장소를 android/gradle.properties에 넣어주지 않으면 gradle 빌드가 실패한다.
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
