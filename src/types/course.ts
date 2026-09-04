/**
 * 코스 추천/저장 API 스펙(swagger `/v3/api-docs` 기준). 추천(S-10/S-11)·저장 탭(S-15).
 * 임의로 바꾸지 말 것 — 바꾸려면 백엔드 담당과 먼저 합의한다.
 * 서버 원본은 경계(`src/api/course.ts`)에서 앱 타입(camelCase·enum)으로 매핑한다.
 */
import type { Category, SizeKey } from "@/types/place";
import type { ServerSize, ServerStatus } from "@/types/store";

// ── 서버 enum ──────────────────────────────────────────────

export type ServerPurpose =
  "WALK" | "CAFE" | "RESTAURANT" | "SHOPPING" | "PLAY";
export type ServerDuration = "SHORT" | "HALF_DAY" | "FULL_DAY";

// ── 서버 응답 DTO ──────────────────────────────────────────

/** 코스를 이루는 지점 하나(`CourseResponse.stores[]`). 지점별 leg 정보는 없다. */
export interface CourseStoreResponse {
  storeId: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  /** 방문 순서(1부터). 정렬·순번 핀에 쓴다. */
  arrivalOrder: number;
  status: ServerStatus;
  reviewCount: number;
  tags: string[];
}

/** 코스와 함께 내려오는 인근 장소(`CourseResponse.nearby[]`). storeId는 아직 미제공(문의 중). */
export interface NearbyPlaceResponse {
  title: string;
  type: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  source: string | null;
  storeId?: string | null;
  address?: string | null;
}

/** `POST /courses/recommend`·`GET /courses/{id}` 공통 응답. */
export interface CourseResponse {
  id: string;
  title: string;
  dogSize: ServerSize;
  purposes: ServerPurpose[];
  duration: ServerDuration;
  /** m */
  totalDistance: number;
  /** 분(도보) */
  totalDuration: number;
  /** 티맵 보행자 경로 좌표쌍 배열([lat, lng]로 가정 — api/course.ts 참고). */
  walkPath: number[][] | null;
  description: string | null;
  relaxed: boolean;
  stores: CourseStoreResponse[];
  nearby: NearbyPlaceResponse[];
}

/** `POST /courses/recommend` 요청 바디. */
export interface CourseRecommendRequestBody {
  dogSize: ServerSize;
  purposes: ServerPurpose[];
  duration: ServerDuration;
  lat: number;
  lng: number;
  tags?: string[];
}

/** `POST /courses` 요청 바디(저장). */
export interface CourseSaveRequestBody {
  title: string;
  dogSize: ServerSize;
  purposes: ServerPurpose[];
  duration: ServerDuration;
  description?: string;
  storeIds: string[];
}

/** `POST /courses` 응답 — 저장된 코스 id만 온다(상세는 재조회). */
export interface CourseCreateResponse {
  courseId: string;
}

/** `PATCH /user/me/saved-courses/{id}` 요청 바디. */
export interface CourseRenameRequestBody {
  title: string;
}

/** `GET /user/me/saved-courses`의 코스 요약 한 건. */
export interface SavedCourseSummaryResponse {
  courseId: string;
  title: string;
  storeCount: number;
  storeNames: string[];
  totalDistance: number;
  totalDuration: number;
  dogSize: ServerSize;
  createdAt: string;
}

/** `GET /user/me/saved-courses` 응답 봉투. */
export interface SavedCourseListResponse {
  courses: SavedCourseSummaryResponse[];
}

// ── 앱 타입 ────────────────────────────────────────────────

/** 코스 목적. 서버 enum과 1:1(경계에서 매핑). */
export type CoursePurpose = "walk" | "meal" | "cafe" | "shopping" | "play";

/** 코스 소요 시간. 시간 → 지점 수로 매핑된다(상수 참고). */
export type CourseDuration = "hour" | "halfDay" | "fullDay";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/** 사용자가 검색으로 직접 지정한 출발 지점(GPS 미사용). */
export interface StartPoint extends Coordinate {
  /** 표시용 라벨(선택한 가게·장소명). */
  label: string;
}

/**
 * `POST /courses/recommend` 요청(앱 형태).
 * 해시태그는 서버가 선택적으로 받으므로 tags로 함께 넘긴다.
 */
export interface CourseRecommendRequest {
  size: SizeKey;
  purposes: CoursePurpose[];
  duration: CourseDuration;
  start: Coordinate;
  tags?: string[];
}

export interface CourseWaypoint {
  placeId: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  // 서버가 지점별 leg를 주지 않아 현재는 항상 null(추후 제공 시 매핑).
  legToNext: {
    distance: number;
    duration: number;
  } | null;
}

export interface NearbyPlace {
  title: string;
  category: Category;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  source: string | null;
  // storeId가 오면 실제 가게 상세로, 없으면 프리뷰로 연다.
  storeId: string | null;
  address: string | null;
}

/** 저장 목록(S-15 코스 탭)용 요약(`GET /user/me/saved-courses`). */
export interface SavedCoursePreview {
  id: string;
  title: string;
  size: SizeKey;
  storeCount: number;
  storeNames: string[];
  totalDistance: number;
  totalTime: number;
  createdAt: string;
}

/** 추천/상세 코스(S-11). 저장 시에도 이 지점들(storeIds)을 재사용한다. */
export interface Course {
  id: string;
  /** 서버 생성 제목. 저장 요청에도 그대로 쓴다. */
  title: string;
  description: string | null;
  size: SizeKey;
  purposes: CoursePurpose[];
  duration: CourseDuration;
  waypoints: CourseWaypoint[];
  /** 티맵 보행자 경로 좌표. 경로 API 실패 시 null → 순번 핀 직선 연결. */
  walkPath: Coordinate[] | null;
  /** 총 거리(m). walkPath가 null이면 직선 기준. */
  totalDistance: number;
  /** 총 소요(분, 도보). */
  totalTime: number;
  /** true면 조건 맞는 장소가 부족해 조건을 완화한 결과("조건을 조금 넓혔어요"). */
  relaxed: boolean;
  /** 코스와 별개로 함께 내려오는 인근 장소(방어적 표시). */
  nearby: NearbyPlace[];
}
