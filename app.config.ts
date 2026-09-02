import type { ConfigContext, ExpoConfig } from "expo/config";

// 스플래시·아이콘 배경색을 JS 쪽 디자인 토큰과 한 소스로 묶는다.
// (@/ alias는 Metro 전용이라 설정 파일에서는 상대경로로 가져와야 한다)
import { Palette } from "./src/constants/palette.ts";

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
    "NAVER_MAP_CLIENT_ID 가 없습니다. .env.example을 복사해 .env를 만들고 값을 채우세요.",
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "walwang",
  slug: "walwang",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo.png",
  scheme: "walwang",
  // [라이트 모드 고정] Figma 컬러 가이드가 한 벌뿐이라 다크 팔레트를 만들지 않는다.
  // "automatic"으로 두면 OS가 다크일 때 네이티브 헤더/탭바만 검게 변해서
  // 라이트로 그린 화면과 색이 어긋난다.
  userInterfaceStyle: "light",

  // [New Architecture(Fabric) 관련 — 중요]
  // 여기에 newArchEnabled를 쓰지 말 것. SDK 57에서 이 키는 제거됐다.
  // - @expo/config-types의 ExpoConfig에 없어서 tsc가 에러를 낸다
  // - node_modules 어디에서도 읽지 않는다 (실측 확인)
  // - false로 넣고 prebuild를 돌려도 gradle.properties는 newArchEnabled=true 그대로다
  // expo-build-properties의 android.newArchEnabled도 SDK 57에서 삭제됐다.
  // RN 0.86 기준 구 아키텍처 자체가 없어져서 New Arch는 끌 수단이 아예 없다.
  // 즉 @mj-studio/react-native-naver-map 2.x의 New Arch 요구조건은 항상 충족된다.

  ios: {
    icon: "./assets/expo.icon",
  },
  android: {
    package: "com.walwang.android",
    adaptiveIcon: {
      backgroundColor: Palette.main[400],
      // 안드로이드는 이 이미지를 제조사별 마스크(원·스퀘어클·물방울)로 잘라내고
      // 가운데 약 66%만 보이는 걸 보장한다. 그래서 여기엔 logo.png를 그대로 쓰면 안 된다.
      // logo-foreground.png = 배경을 투명하게 걷어내고 강아지를 66% 안으로 축소한 버전.
      // (logo.png에서 스크립트로 생성. 로고가 바뀌면 다시 만들어야 한다)
      foregroundImage: "./assets/images/logo-foreground.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    // Pretendard를 빌드 타임에 네이티브로 임베드한다.
    // useFonts() 런타임 로딩과 달리 첫 프레임부터 적용돼서 폰트가 깜빡이지 않는다.
    //
    // [주의] 굵기별로 파일을 따로 등록한다. 안드로이드는 fontWeight으로
    // 굵기 파일을 골라주지 않고, 패밀리 이름이 곧 "파일명"이다.
    // 즉 여기 파일명이 constants/typography.ts의 FontFamily 값과 정확히 같아야 한다.
    // 파일을 추가/교체하면 JS 리로드로는 반영 안 된다 → npx expo run:android
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Pretendard-Regular.ttf",
          "./assets/fonts/Pretendard-Medium.ttf",
          "./assets/fonts/Pretendard-SemiBold.ttf",
        ],
      },
    ],
    [
      "expo-splash-screen",
      {
        // 배경 투명 버전을 쓴다. logo.png는 자체 배경이 #FC8571이라 브랜드색(#FF9A86)
        // 위에 얹으면 살구색 사각형 경계가 그대로 보인다.
        backgroundColor: Palette.main[400],
        image: "./assets/images/logo-splash.png",
        imageWidth: 220,
      },
    ],
    // AndroidManifest.xml에 네이버 지도 CLIENT_ID meta-data를 주입한다.
    ["@mj-studio/react-native-naver-map", { client_id: NAVER_MAP_CLIENT_ID }],
    // 네이버 지도 SDK는 mavenCentral에 없다.
    // 이 저장소를 android/gradle.properties에 넣어주지 않으면 gradle 빌드가 실패한다.
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: ["https://repository.map.naver.com/archive/maven"],
          // 백엔드가 아직 HTTP(비-HTTPS)라 안드로이드 기본 cleartext 차단을 풀어준다.
          // 운영에서 HTTPS로 바뀌면 제거할 것. 변경 후 네이티브 재빌드 필요(expo run:android).
          usesCleartextTraffic: true,
        },
      },
    ],

    // [중요] 아래 세 개는 npx expo install 이 자동으로 넣어주지 못한다.
    // app.config.ts는 "동적 설정"이라 CLI가 파일을 고칠 수 없어서
    // "Cannot automatically write to dynamic config" 경고만 내고 끝난다.
    // 여기 직접 안 적으면 네이티브 모듈은 autolink 되지만 권한(permission)이
    // AndroidManifest에 안 들어가서, 런타임에 카메라/갤러리 요청이 즉시 denied 된다.
    "expo-secure-store",
    [
      "expo-camera",
      {
        // 영수증 촬영용. Android는 이 문자열을 안 쓰지만 iOS 대비 채워둔다.
        cameraPermission:
          "영수증과 매장 사진을 촬영하기 위해 카메라를 사용합니다.",
        recordAudioAndroid: false,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "리뷰에 첨부할 사진을 고르기 위해 사진 보관함에 접근합니다.",
        // expo-image-picker는 기본값으로 RECORD_AUDIO 권한을 넣는다(동영상 촬영 대비).
        // 우리는 녹음을 안 하는데 이게 남아 있으면 스토어 심사에서 사용 목적을 소명해야 한다.
        // false로 주면 "차단 목록"에 올라가서 다른 패키지가 다시 넣는 것도 막아준다.
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
