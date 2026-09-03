import { MOCK_COURSE, MOCK_COURSE_FALLBACK } from "@/mocks/courses";
import type { Course, SavedCoursePreview } from "@/types/course";

// 저장(플로우 C) 코스 탭 개발용 목. 장소 저장은 실연동됨 — 코스 API 연동 시 이 파일 삭제.

function toPreview(
  course: Course,
  title: string,
  createdAt: string,
): SavedCoursePreview {
  return {
    id: course.id,
    title,
    size: course.size,
    storeCount: course.waypoints.length,
    storeNames: course.waypoints.map((waypoint) => waypoint.name),
    totalDistance: course.totalDistance,
    totalTime: course.totalTime,
    createdAt,
  };
}

export const MOCK_SAVED_COURSES: SavedCoursePreview[] = [
  toPreview(MOCK_COURSE, "대형견 · 산책 · 반나절 코스", "2026-08-28T05:00:00Z"),
  toPreview(
    MOCK_COURSE_FALLBACK,
    "서울숲 반나절 산책 코스",
    "2026-08-10T02:30:00Z",
  ),
];
