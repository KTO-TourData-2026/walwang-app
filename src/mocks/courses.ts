import { MOCK_PLACES } from "@/mocks/places";
import type { Coordinate, Course, CourseWaypoint } from "@/types/course";

/**
 * 백엔드 API가 나오기 전까지 코스 결과(S-11) 화면 개발용 목 데이터.
 * 지점은 MOCK_PLACES에서 끌어와 이름·좌표를 일치시킨다 → 지점 탭 시 같은 가게 상세로 이어진다.
 *
 * 실제 API로 갈아탈 때 이 파일만 지우면 되도록, 여기서 Course 외의 타입을 만들지 말 것.
 */

const WAYPOINT_IDS = ["p-001", "p-002", "p-003", "p-004"] as const;

// 지점 간 이동(도보) — [distance(m), duration(분)]. 마지막 지점은 leg 없음.
const LEGS: [number, number][] = [
  [900, 12],
  [1300, 18],
  [1200, 15],
];

function buildWaypoints(): CourseWaypoint[] {
  return WAYPOINT_IDS.map((id, index) => {
    const place = MOCK_PLACES.find((item) => item.id === id);
    if (!place) {
      throw new Error(`MOCK 코스가 존재하지 않는 지점을 참조함: ${id}`);
    }
    const leg = LEGS[index];
    return {
      placeId: place.id,
      name: place.name,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude,
      legToNext: leg ? { distance: leg[0], duration: leg[1] } : null,
    };
  });
}

const waypoints = buildWaypoints();

// 티맵 보행자 경로 좌표. 목에선 지점 사이에 중간점 하나씩 넣어 살짝 꺾인 선을 만든다.
function buildWalkPath(points: CourseWaypoint[]): Coordinate[] {
  const path: Coordinate[] = [];
  points.forEach((point, index) => {
    path.push({ latitude: point.latitude, longitude: point.longitude });
    const next = points[index + 1];
    if (next) {
      path.push({
        latitude: (point.latitude + next.latitude) / 2 + 0.0008,
        longitude: (point.longitude + next.longitude) / 2 - 0.0006,
      });
    }
  });
  return path;
}

/** 기본 목 코스 — 경로(walkPath) 정상 반환 케이스. */
export const MOCK_COURSE: Course = {
  id: "course-001",
  size: "large",
  purposes: ["walk"],
  duration: "halfDay",
  waypoints,
  walkPath: buildWalkPath(waypoints),
  totalDistance: LEGS.reduce((sum, [distance]) => sum + distance, 0),
  totalTime: LEGS.reduce((sum, [, duration]) => sum + duration, 0),
  relaxed: false,
};

/**
 * 폴백 확인용 목 코스 — 경로 API 실패(walkPath: null) + 조건 완화(relaxed: true).
 * result 화면에서 `?variant=fallback`으로 넘기면 이 코스를 보여준다.
 */
export const MOCK_COURSE_FALLBACK: Course = {
  ...MOCK_COURSE,
  id: "course-002",
  walkPath: null,
  relaxed: true,
};
