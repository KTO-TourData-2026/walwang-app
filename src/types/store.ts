/**
 * store 도메인 API 스펙(swagger `/v3/api-docs` 기준). 지도 핀(S-04)·검색·상세(S-05).
 * 임의로 바꾸지 말 것 — 바꾸려면 백엔드 담당과 먼저 합의한다.
 * 서버 원본은 경계(`src/api/store.ts`)에서 앱 타입(camelCase·enum)으로 매핑한다.
 */
import type { Place, SizeKey } from "@/types/place";

// ── 서버 응답 DTO ──────────────────────────────────────────

/** 좌표. 앱에선 latitude/longitude로 편다. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export type ServerSize = "SMALL_MEDIUM" | "LARGE";
export type ServerStatus = "POSSIBLE" | "IMPOSSIBLE" | "UNKNOWN";

/** 크기별 상태 한 줄. 응답은 이 객체의 배열로 온다(앱에선 Record로 접는다). */
export interface SizeStatusResponse {
  size: ServerSize;
  status: ServerStatus;
  possibleCount: number;
  impossibleCount: number;
}

/** `GET /stores`·`GET /stores/search`의 카드 응답. */
export interface StoreCardResponse {
  storeId: string;
  storeName: string;
  /** 데모용 가짜 상호명. 표시에는 이 값을 우선 쓰고, 없으면 storeName. */
  displayName: string | null;
  geog: GeoPoint;
  address: string;
  type: string;
  sizeStatus: SizeStatusResponse[];
}

/** `GET /stores/{storeId}`의 상세 응답(카드 필드 + 상세 전용). */
export interface StoreDetailResponse {
  storeId: string;
  name: string;
  geog: GeoPoint;
  address: string;
  type: string;
  tags: string[];
  openTime: string | null;
  closeTime: string | null;
  possibleCount: number;
  impossibleCount: number;
  lastVerifiedAt: string | null;
  sizeStatus: SizeStatusResponse[];
  thumbnailUrls: string[];
}

// ── 앱 타입 ────────────────────────────────────────────────

/** 크기별 확인 리뷰 수(상세 sizeStatus에서 접음). */
export type SizeCounts = Record<
  SizeKey,
  { possible: number; impossible: number }
>;

/** 가게 상세(S-05). 카드(Place) + 상세 전용 필드를 더한 형태. */
export interface StoreDetail extends Place {
  reviewCount: number;
  lastVerifiedAt: string | null;
  tags: string[];
  openTime: string | null;
  closeTime: string | null;
  thumbnailUrls: string[];
  sizeCounts: SizeCounts;
}
