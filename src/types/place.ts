/**
 * 백엔드와 확정한 API 응답 스펙.
 * 임의로 바꾸지 말 것 — 바꾸려면 백엔드 담당과 먼저 합의한다.
 */

export type SizeKey = "smallMedium" | "large";
export type PlaceStatus = "allowed" | "denied" | "unknown";
export type Category = "park" | "cafe" | "restaurant" | "shopping";

export interface Place {
  id: string;
  name: string;
  category: Category;
  /** 도로명주소. 백엔드 `location` 필드(가게 상세·검색 응답). */
  location: string;
  latitude: number;
  longitude: number;
  sizeStatus: Record<SizeKey, PlaceStatus>;
  reviewCount: number;
  lastVerifiedAt: string | null;
}
