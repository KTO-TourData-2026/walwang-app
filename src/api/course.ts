import { apiClient } from "@/api/client";
import { getDemoMode } from "@/api/demo";
import { API_ENDPOINTS } from "@/api/endpoints";
import { mapCategory } from "@/api/store";
import { SHOW_COURSE_NEARBY } from "@/constants/feature-flags";
import type {
  Coordinate,
  Course,
  CourseCreateResponse,
  CourseDuration,
  CourseLegResponse,
  CoursePurpose,
  CourseRecommendRequest,
  CourseRecommendRequestBody,
  CourseResponse,
  CourseSaveRequestBody,
  CourseStoreResponse,
  CourseWaypoint,
  NearbyPlace,
  NearbyPlaceResponse,
  SavedCoursePreview,
  SavedCourseListResponse,
  SavedCourseSummaryResponse,
  ServerDuration,
  ServerPurpose,
} from "@/types/course";
import type { SizeKey } from "@/types/place";
import type { ServerSize } from "@/types/store";

const SIZE_TO_SERVER: Record<SizeKey, ServerSize> = {
  smallMedium: "SMALL_MEDIUM",
  large: "LARGE",
};

function sizeFromServer(size: ServerSize): SizeKey {
  return size === "SMALL_MEDIUM" ? "smallMedium" : "large";
}

const PURPOSE_TO_SERVER: Record<CoursePurpose, ServerPurpose> = {
  walk: "WALK",
  meal: "RESTAURANT",
  cafe: "CAFE",
  shopping: "SHOPPING",
  play: "PLAY",
};

const PURPOSE_FROM_SERVER: Record<ServerPurpose, CoursePurpose> = {
  WALK: "walk",
  RESTAURANT: "meal",
  CAFE: "cafe",
  SHOPPING: "shopping",
  PLAY: "play",
};

const DURATION_TO_SERVER: Record<CourseDuration, ServerDuration> = {
  hour: "SHORT",
  halfDay: "HALF_DAY",
  fullDay: "FULL_DAY",
};

const DURATION_FROM_SERVER: Record<ServerDuration, CourseDuration> = {
  SHORT: "hour",
  HALF_DAY: "halfDay",
  FULL_DAY: "fullDay",
};

// 좌표가 문자열·null로 와도 지도가 NaN으로 터지지 않게 유한 숫자로 강제한다.
function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function isRenderableCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
  );
}

function mapWaypoint(
  store: CourseStoreResponse,
  leg: CourseLegResponse | undefined,
): CourseWaypoint {
  return {
    placeId: String(store.storeId),
    name: store.name,
    category: mapCategory(store.type),
    latitude: toNum(store.lat),
    longitude: toNum(store.lng),
    legToNext: leg
      ? { distance: toNum(leg.distance), duration: toNum(leg.duration) }
      : null,
  };
}

// swagger에 좌표 순서 명시가 없어 서버 GeoPoint({ lat, lng })에 맞춰 [lat, lng]로 가정한다.
// 데모에서 경로가 어긋나면 이 매핑만 뒤집으면 된다.
function mapWalkPath(path: number[][] | null | undefined): Coordinate[] | null {
  if (!path || path.length === 0) {
    return null;
  }
  const coords = path
    .filter((pair) => Array.isArray(pair) && pair.length >= 2)
    .map(([lat, lng]) => ({ latitude: toNum(lat), longitude: toNum(lng) }))
    .filter((coord) => isRenderableCoord(coord.latitude, coord.longitude));
  return coords.length > 0 ? coords : null;
}

function mapNearby(place: NearbyPlaceResponse): NearbyPlace {
  return {
    title: place.title,
    category: mapCategory(place.type),
    latitude: toNum(place.lat),
    longitude: toNum(place.lng),
    imageUrl: place.imageUrl ?? null,
    source: place.source ?? null,
    // storeId는 스키마 확정 대기 — 아직 없으면 상세 이동 대신 프리뷰로 연다.
    storeId: place.storeId ?? null,
    address: place.address ?? null,
  };
}

function mapCourse(res: CourseResponse): Course {
  const stores = [...(res.stores ?? [])].sort(
    (a, b) => (a.arrivalOrder ?? 0) - (b.arrivalOrder ?? 0),
  );
  // legs는 코스 레벨 이동 구간(길이 = 지점 수 - 1). fromIndex로 "현재 → 다음" 구간만
  // 매핑해 누락·비연속에도 지점이 밀리지 않게 한다. 0/1-base는 fromIndex 최소값으로 판별.
  const legs = res.legs ?? [];
  const legBase = legs.length
    ? Math.min(...legs.map((leg) => leg.fromIndex ?? 0))
    : 0;
  const legByFrom = new Map(legs.map((leg) => [leg.fromIndex, leg]));
  return {
    id: String(res.id),
    title: res.title,
    description: res.description ?? null,
    size: sizeFromServer(res.dogSize),
    purposes: (res.purposes ?? [])
      .map((purpose) => PURPOSE_FROM_SERVER[purpose])
      .filter((purpose): purpose is CoursePurpose => Boolean(purpose)),
    duration: DURATION_FROM_SERVER[res.duration] ?? "halfDay",
    waypoints: stores.map((store, index) => {
      const leg = legByFrom.get(legBase + index);
      return mapWaypoint(
        store,
        leg?.toIndex === legBase + index + 1 ? leg : undefined,
      );
    }),
    walkPath: mapWalkPath(res.walkPath),
    totalDistance: res.totalDistance ?? 0,
    totalTime: res.totalDuration ?? 0,
    relaxed: res.relaxed ?? false,
    // nearby는 정책 검증 전까지 임시 숨김(피처 플래그 한 곳에서 온오프). off면 빈 배열로
    // 내려 결과 화면 리스트·지도 마커가 함께 사라진다.
    nearby: SHOW_COURSE_NEARBY
      ? (res.nearby ?? [])
          .map(mapNearby)
          .filter((place) => isRenderableCoord(place.latitude, place.longitude))
      : [],
  };
}

function mapSavedCourse(res: SavedCourseSummaryResponse): SavedCoursePreview {
  return {
    id: String(res.courseId),
    title: res.title,
    size: sizeFromServer(res.dogSize),
    storeCount: res.storeCount ?? res.storeNames?.length ?? 0,
    storeNames: res.storeNames ?? [],
    totalDistance: res.totalDistance ?? 0,
    totalTime: res.totalDuration ?? 0,
    createdAt: res.createdAt,
  };
}

function toRecommendBody(
  request: CourseRecommendRequest,
): CourseRecommendRequestBody {
  return {
    dogSize: SIZE_TO_SERVER[request.size],
    purposes: request.purposes.map((purpose) => PURPOSE_TO_SERVER[purpose]),
    duration: DURATION_TO_SERVER[request.duration],
    lat: request.start.latitude,
    lng: request.start.longitude,
    ...(request.tags && request.tags.length > 0 ? { tags: request.tags } : {}),
  };
}

function toSaveBody(course: Course): CourseSaveRequestBody {
  return {
    title: course.title,
    dogSize: SIZE_TO_SERVER[course.size],
    purposes: course.purposes.map((purpose) => PURPOSE_TO_SERVER[purpose]),
    duration: DURATION_TO_SERVER[course.duration],
    ...(course.description ? { description: course.description } : {}),
    storeIds: course.waypoints.map((waypoint) => waypoint.placeId),
  };
}

// 조회는 현재 모드(getDemoMode)를 붙이고, 쓰기 중 이름변경·삭제엔 붙이지 않는다(§3 예외).
// 저장(POST /courses)은 조회와 공간을 맞춰야 하므로 붙인다.

export async function recommendCourse(
  request: CourseRecommendRequest,
): Promise<Course> {
  const { data } = await apiClient.post<CourseResponse>(
    API_ENDPOINTS.course.recommend,
    toRecommendBody(request),
    { params: { demo: getDemoMode() } },
  );
  return mapCourse(data);
}

// 데모 공간은 분리돼 있어 저장·조회 모두 demo=true여야 매칭된다(안 맞으면 404).
// 응답은 courseId만 → 상세는 재조회로 렌더한다.
export async function saveCourse(course: Course): Promise<string> {
  const { data } = await apiClient.post<CourseCreateResponse>(
    API_ENDPOINTS.course.base,
    toSaveBody(course),
    { params: { demo: getDemoMode() } },
  );
  return String(data.courseId);
}

// 시연에서 저장한 코스는 demo=true로만 조회된다(POST /courses도 demo로 저장하므로 일치).
export async function getCourseDetail(courseId: string): Promise<Course> {
  const { data } = await apiClient.get<CourseResponse>(
    API_ENDPOINTS.course.detail(courseId),
    { params: { demo: getDemoMode() } },
  );
  return mapCourse(data);
}

export async function getSavedCourses(): Promise<SavedCoursePreview[]> {
  const { data } = await apiClient.get<SavedCourseListResponse>(
    API_ENDPOINTS.user.savedCourses,
    { params: { demo: getDemoMode() } },
  );
  return (data.courses ?? []).map(mapSavedCourse);
}

export async function renameCourse(
  courseId: string,
  title: string,
): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.user.savedCourseDetail(courseId), {
    title,
  });
}

// 삭제만 /course/{id}(단수) — #19에서 단수 경로 실재 확인 완료.
export async function deleteCourse(courseId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.course.remove(courseId));
}
