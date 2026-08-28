import type { PlaceStatus, SizeKey } from "@/types/place";

/** 동반 상태 3단계 한글 라벨. */
export const STATUS_LABEL: Record<PlaceStatus, string> = {
  allowed: "가능",
  denied: "불가",
  unknown: "미확인",
};

/** 크기 축 2단계 한글 라벨. */
export const SIZE_LABEL: Record<SizeKey, string> = {
  smallMedium: "소·중형견",
  large: "대형견",
};
