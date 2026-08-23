/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

import type { PlaceStatus } from "@/types/place";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",

    // 동반 가능 여부 3색. 지도 마커와 상태 뱃지가 이 값을 공유한다.
    statusAllowed: "#1F9D55",
    statusDenied: "#D64545",
    statusUnknown: "#8B8D98",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",

    // 어두운 배경에서 대비를 확보하려고 light보다 한 단계 밝게 잡았다.
    statusAllowed: "#46C77E",
    statusDenied: "#F06A6A",
    statusUnknown: "#9EA1AB",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * PlaceStatus 값을 그대로 색 키로 쓰기 위한 매핑.
 *
 * 이렇게 해두면 `theme[StatusColorKey[place.sizeStatus.large]]` 한 줄로 색을 얻을 수 있고,
 * PlaceStatus에 새 상태가 추가되면 여기서 타입 에러가 나서 빠뜨릴 수 없다.
 */
export const StatusColorKey = {
  allowed: "statusAllowed",
  denied: "statusDenied",
  unknown: "statusUnknown",
} as const satisfies Record<PlaceStatus, ThemeColor>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * 폰트 크기.
 *
 * [RN 함정] RN에는 rem/em이 없고 숫자는 전부 dp다. 그리고 lineHeight는
 * 배수(1.5)가 아니라 절대값을 요구한다 — 1.5를 넣으면 줄이 겹쳐서 글자가 잘린다.
 * 그래서 size와 lineHeight를 쌍으로 들고 다닌다.
 */
export const FontSize = {
  caption: 12,
  small: 14,
  body: 16,
  subhead: 18,
  title: 22,
  display: 28,
} as const;

export const LineHeight = {
  caption: 16,
  small: 20,
  body: 24,
  subhead: 26,
  title: 30,
  display: 36,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
