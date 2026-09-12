import type { CourseDuration, CoursePurpose } from "@/types/course";

export const PURPOSE_LABEL: Record<CoursePurpose, string> = {
  walk: "산책",
  meal: "식사",
  cafe: "카페",
  shopping: "쇼핑",
  play: "놀이",
};

export const PURPOSE_ORDER: CoursePurpose[] = [
  "walk",
  "meal",
  "cafe",
  "shopping",
  "play",
];

export const DURATION_LABEL: Record<CourseDuration, string> = {
  hour: "1시간",
  halfDay: "반나절",
  fullDay: "하루",
};

export const DURATION_ORDER: CourseDuration[] = ["hour", "halfDay", "fullDay"];

/** 시간 → 추천 장소 수 안내 문구((?) 팝오버). 티맵 경유지 상한으로 최대 4장소. */
export const DURATION_POINT_HINT: Record<CourseDuration, string> = {
  hour: "2곳 추천",
  halfDay: "3~4곳 추천",
  fullDay: "4곳 추천",
};
