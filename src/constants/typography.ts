import type { TextStyle } from "react-native";

/**
 * Pretendard 패밀리 이름.
 *
 * [RN 최대 함정] 웹처럼 `fontFamily: "Pretendard"` + `fontWeight: 600` 을 쓰면
 * 안드로이드에서 SemiBold 파일을 골라주지 않는다. Regular를 알고리즘으로
 * 억지로 굵게 만든(fake bold) 뭉개진 글자가 나온다.
 * 그래서 **굵기마다 별도 패밀리로 등록하고 fontWeight은 아예 쓰지 않는다.**
 *
 * - Android: 패밀리 이름 = 폰트 "파일명" (Pretendard-SemiBold.ttf → "Pretendard-SemiBold")
 * - iOS: 파일 내부 PostScript name. Pretendard는 파일명과 같아서 그대로 통한다.
 *
 * 폰트 등록은 app.config.ts의 expo-font 플러그인에서 한다(빌드 타임 임베드).
 * 파일을 추가/변경하면 JS 리로드로는 반영되지 않으니 `npx expo run:android`.
 */
export const FontFamily = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
} as const;

/**
 * 타이포그래피 토큰. Figma [타이포그래피 스타일 가이드]와 1:1 대응한다.
 *
 * [RN 함정] lineHeight는 배수나 %가 아니라 **절대값(dp)** 만 받는다.
 * 1.2를 넣으면 줄 간격이 1.2dp가 되어 글자가 겹쳐 잘린다.
 * 그래서 Figma의 120%/140%를 미리 곱하고 반올림한 정수를 박아둔다.
 *
 * letterSpacing은 전 스타일 0이므로(=RN 기본값) 아예 넣지 않는다.
 */
export const Typography = {
  // Heading — SemiBold, 120%
  head01: { fontFamily: FontFamily.semibold, fontSize: 32, lineHeight: 38 },
  head02: { fontFamily: FontFamily.semibold, fontSize: 28, lineHeight: 34 },
  head03: { fontFamily: FontFamily.semibold, fontSize: 24, lineHeight: 29 },

  // Subtitle — SemiBold, 120%
  subtitle01: { fontFamily: FontFamily.semibold, fontSize: 20, lineHeight: 24 },
  subtitle02: { fontFamily: FontFamily.semibold, fontSize: 18, lineHeight: 22 },
  subtitle03: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 19 },
  subtitle04: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 17 },
  subtitle05: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 14 },

  // Label — Medium/Regular 교차, 140%
  label01: { fontFamily: FontFamily.medium, fontSize: 16, lineHeight: 22 },
  label02: { fontFamily: FontFamily.regular, fontSize: 16, lineHeight: 22 },
  label03: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20 },
  label04: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  label05: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17 },
  label06: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17 },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof Typography;
