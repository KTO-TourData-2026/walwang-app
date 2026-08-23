import { Text, type TextProps } from "react-native";

import { Palette, Typography, type TypographyToken } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  /** Figma 타이포그래피 토큰 이름 (head01 · subtitle03 · label02 ...) */
  type?: TypographyToken;
  /** 글자색. 기본은 본문색 */
  color?: string;
};

/**
 * 타이포그래피 토큰을 받는 텍스트.
 *
 * fontSize/fontWeight/lineHeight를 직접 넘기지 말 것 — 굵기는 fontFamily로
 * 결정되므로 fontWeight을 주면 안드로이드에서 fake bold가 겹쳐 뭉개진다.
 */
export function ThemedText({
  style,
  type = "label02",
  color = Palette.gray[700],
  ...rest
}: ThemedTextProps) {
  return <Text style={[{ color }, Typography[type], style]} {...rest} />;
}
