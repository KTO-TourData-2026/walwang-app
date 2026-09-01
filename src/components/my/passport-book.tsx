import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/** 원본 펼친 책 일러스트의 좌표계. slot·크롭이 공유한다. */
export const BOOK = { width: 380, height: 288 };

/** side별 크롭 창(book 좌표). 두 창은 같은 크기라 프레임 비율이 일정하고 x만 좌/우로 옮긴다. */
export const WINDOWS = {
  left: { x: 16, y: 24, w: 189, h: 236 },
  right: { x: 175, y: 24, w: 189, h: 236 },
} as const;

export const WINDOW_ASPECT = WINDOWS.left.w / WINDOWS.left.h;

// Svg viewBox를 크롭 창으로 잡아 왜곡 없이 한쪽 페이지만 확대해 보여준다.
export function PassportBook({
  width,
  height,
  side,
}: {
  width: number;
  height: number;
  side: "left" | "right";
}) {
  const w = WINDOWS[side];

  return (
    <Svg width={width} height={height} viewBox={`${w.x} ${w.y} ${w.w} ${w.h}`}>
      <Defs>
        <LinearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#37436E" />
          <Stop offset="1" stopColor="#222B49" />
        </LinearGradient>
        <LinearGradient id="pageL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FCFAF4" />
          <Stop offset="0.78" stopColor="#F1ECE1" />
          <Stop offset="1" stopColor="#E4DCCE" />
        </LinearGradient>
        <LinearGradient id="pageR" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#E4DCCE" />
          <Stop offset="0.22" stopColor="#F1ECE1" />
          <Stop offset="1" stopColor="#FCFAF4" />
        </LinearGradient>
        <LinearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#2A3350" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#2A3350" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#2A3350" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect x="16" y="24" width="348" height="236" rx="17" fill="url(#cover)" />
      <Rect
        x="16"
        y="24"
        width="348"
        height="236"
        rx="17"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.1"
        strokeWidth="1.5"
      />

      <Rect x="27" y="33" width="163" height="218" rx="8" fill="#D8D1C1" />
      <Rect x="190" y="33" width="163" height="218" rx="8" fill="#D8D1C1" />
      <Rect x="30" y="35" width="158" height="214" rx="7" fill="url(#pageL)" />
      <Rect x="192" y="35" width="158" height="214" rx="7" fill="url(#pageR)" />

      <Rect
        x="40"
        y="45"
        width="138"
        height="194"
        rx="5"
        fill="none"
        stroke="#C6BEAC"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <Rect
        x="202"
        y="45"
        width="138"
        height="194"
        rx="5"
        fill="none"
        stroke="#C6BEAC"
        strokeOpacity="0.5"
        strokeWidth="1"
      />

      <Rect x="150" y="35" width="80" height="214" fill="url(#spine)" />
      <Rect x="188" y="30" width="4" height="224" rx="2" fill="#20294A" />
    </Svg>
  );
}
