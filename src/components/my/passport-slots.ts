// 도장 슬롯 좌표는 원본 책(BOOK 380×288) 기준 — 렌더 시 크롭 창 기준으로 환산한다.
export const LEFT_SLOTS: { x: number; y: number }[] = [
  { x: 74, y: 78 },
  { x: 128, y: 110 },
  { x: 70, y: 150 },
  { x: 126, y: 182 },
  { x: 74, y: 214 },
];

export const RIGHT_SLOTS: { x: number; y: number }[] = [
  { x: 250, y: 78 },
  { x: 305, y: 110 },
  { x: 246, y: 150 },
  { x: 302, y: 182 },
  { x: 250, y: 214 },
];

export function slotsFor(side: "left" | "right") {
  return side === "left" ? LEFT_SLOTS : RIGHT_SLOTS;
}

export const STAMPS_PER_PAGE = 5;

/** book 좌표 단위 지름(px는 크롭 스케일을 곱함). */
const BASE_SIZE = 52;

// id 해시로 크기·각도를 결정론적으로 — 리렌더마다 흔들리지 않게 Math.random 대신.
export function stampJitter(id: string): { size: number; angle: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  }
  const a = (hash % 100) / 100;
  const b = ((hash >> 4) % 100) / 100;
  return {
    size: Math.round(BASE_SIZE + (a - 0.5) * 10),
    angle: Math.round((b - 0.5) * 28),
  };
}
