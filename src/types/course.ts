/**
 * 코스 추천 API 응답/요청 스펙(프론트 사용 형태).
 * `POST /courses/recommend`(요청·결과) / `POST /courses`(저장) 기준의 초안이며,
 * 현재는 화면 props를 맞추는 용도다. UI만 구현하고 실제 연동은 범위 밖.
 * 임의로 바꾸지 말 것 — 바꾸려면 백엔드 담당과 먼저 합의한다.
 */
import type { Category, SizeKey } from "@/types/place";

/** 코스 목적. 지도 홈 필터가 아닌 추천 키워드 개념이라 여기서 소유한다. */
export type CoursePurpose = "walk" | "meal" | "cafe";

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
 * `POST /courses/recommend` 요청 바디.
 * 해시태그는 요청 바디에 없어 UI에만 두므로 이 타입에 포함하지 않는다.
 */
export interface CourseRecommendRequest {
  size: SizeKey;
  /** 복수 선택. */
  purposes: CoursePurpose[];
  duration: CourseDuration;
  start: Coordinate;
}

/** 코스를 이루는 지점 하나. */
export interface CourseWaypoint {
  placeId: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  /**
   * 이 지점 → 다음 지점 이동 정보(지점별 체류 시간이 아님).
   * 마지막 지점은 다음이 없으므로 null.
   */
  legToNext: {
    /** m */
    distance: number;
    /** 분(도보) */
    duration: number;
  } | null;
}

// 저장 목록(S-15 코스 탭)용 요약(`GET /user/me/saved-courses`).
// 탭 시 이 id를 재사용해 S-11을 재현한다(재계산 없음).
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

/**
 * 추천된 코스. 저장(`POST /courses`) 시에도 이 id를 재사용한다.
 */
export interface Course {
  id: string;
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
}
