import { MOCK_COURSE, MOCK_COURSE_FALLBACK } from "@/mocks/courses";
import { MOCK_PLACES } from "@/mocks/places";
import type { Course, SavedCoursePreview } from "@/types/course";
import type { Place } from "@/types/place";

// 저장(플로우 C) 화면 개발용 목. 실연동 시 이 파일만 지우면 되도록 Place/Course 외 타입을 만들지 말 것.

export const MOCK_SAVED_PLACES: Place[] = ["p-002", "p-001", "p-004", "p-016"]
  .map((id) => MOCK_PLACES.find((place) => place.id === id))
  .filter((place): place is Place => place !== undefined);

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
