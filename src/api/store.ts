import { apiClient } from "@/api/client";
import { DEMO_MODE } from "@/api/demo";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { CourseStoreResponse } from "@/types/course";
import type { Category, PlaceStatus, Place, SizeKey } from "@/types/place";
import type { Review, ReviewResponse } from "@/types/review";
import type {
  ServerStatus,
  SizeCounts,
  SizeStatusResponse,
  StoreCardResponse,
  StoreDetail,
  StoreDetailResponse,
} from "@/types/store";

// store 도메인 단일 호출 함수. 서버 원본을 이 파일(경계)에서 앱 타입으로 매핑한다.

// 서버 store type(문자열)을 앱 Category로 접는다. swagger에 enum이 없어
// api-architecture.md 규약(PARK/CAFE/… → park/cafe/…)을 따른다.
const TYPE_TO_CATEGORY: Record<string, Category> = {
  PARK: "park",
  CAFE: "cafe",
  RESTAURANT: "restaurant",
  SHOPPING: "shopping",
  // 코스 nearby 전용 타입
  FESTIVAL: "festival",
  ATTRACTION: "attraction",
};

// 이미 경고한 type은 다시 안 찍는다(가게 수백 개면 같은 경고가 도배됨).
const warnedTypes = new Set<string>();

// 서버 store type → 앱 Category. review 도메인(마이 리뷰)에서도 재사용한다.
export function mapCategory(type: string): Category {
  const category = TYPE_TO_CATEGORY[type?.toUpperCase?.() ?? ""];
  if (category) {
    return category;
  }
  if (__DEV__ && !warnedTypes.has(type)) {
    warnedTypes.add(type);
    console.warn(`[store] 알 수 없는 type "${type}" → cafe 폴백`);
  }
  return "cafe";
}

const STATUS_MAP: Record<ServerStatus, PlaceStatus> = {
  POSSIBLE: "allowed",
  IMPOSSIBLE: "denied",
  UNKNOWN: "unknown",
};

function sizeKeyOf(size: SizeStatusResponse["size"]): SizeKey {
  return size === "SMALL_MEDIUM" ? "smallMedium" : "large";
}

// 크기별 상태 배열 → Record. 빠진 크기는 미확인(unknown)으로 채운다.
function foldSizeStatus(
  list: SizeStatusResponse[] | undefined,
): Record<SizeKey, PlaceStatus> {
  const result: Record<SizeKey, PlaceStatus> = {
    smallMedium: "unknown",
    large: "unknown",
  };
  for (const item of list ?? []) {
    result[sizeKeyOf(item.size)] = STATUS_MAP[item.status] ?? "unknown";
  }
  return result;
}

function foldSizeCounts(list: SizeStatusResponse[] | undefined): SizeCounts {
  const result: SizeCounts = {
    smallMedium: { possible: 0, impossible: 0 },
    large: { possible: 0, impossible: 0 },
  };
  for (const item of list ?? []) {
    result[sizeKeyOf(item.size)] = {
      possible: item.possibleCount ?? 0,
      impossible: item.impossibleCount ?? 0,
    };
  }
  return result;
}

function mapStoreCard(res: StoreCardResponse): Place {
  return {
    id: String(res.storeId),
    name: res.displayName ?? res.storeName,
    category: mapCategory(res.type),
    location: res.address,
    latitude: res.geog?.lat ?? 0,
    longitude: res.geog?.lng ?? 0,
    sizeStatus: foldSizeStatus(res.sizeStatus),
  };
}

function mapStoreDetail(res: StoreDetailResponse): StoreDetail {
  const petVerified = res.petVerified ?? false;
  return {
    id: String(res.storeId),
    name: res.name,
    category: mapCategory(res.type),
    location: res.address,
    latitude: res.geog?.lat ?? 0,
    longitude: res.geog?.lng ?? 0,
    // 한국관광공사 공식 검증(petVerified) 장소는 리뷰 수와 무관하게 두 크기 모두 가능으로 표시한다.
    sizeStatus: petVerified
      ? { smallMedium: "allowed", large: "allowed" }
      : foldSizeStatus(res.sizeStatus),
    // reviewCount는 서버에 없어 확인 리뷰(가능+불가) 합으로 파생한다.
    reviewCount: (res.possibleCount ?? 0) + (res.impossibleCount ?? 0),
    lastVerifiedAt: res.lastVerifiedAt ?? null,
    tags: res.tags ?? [],
    openTime: res.openTime ?? null,
    closeTime: res.closeTime ?? null,
    thumbnailUrls: res.thumbnailUrls ?? [],
    sizeCounts: foldSizeCounts(res.sizeStatus),
  };
}

export interface StoresQueryParams {
  lat: number;
  lng: number;
  radius?: number;
}

export async function getStores(params: StoresQueryParams): Promise<Place[]> {
  const { data } = await apiClient.get<StoreCardResponse[]>(
    API_ENDPOINTS.store.list,
    { params: { ...params, demo: DEMO_MODE } },
  );
  return data.map(mapStoreCard);
}

export async function searchStores(keyword: string): Promise<Place[]> {
  const { data } = await apiClient.get<StoreCardResponse[]>(
    API_ENDPOINTS.store.search,
    { params: { keyword, demo: DEMO_MODE } },
  );
  return data.map(mapStoreCard);
}

export async function getStoreDetail(storeId: string): Promise<StoreDetail> {
  const { data } = await apiClient.get<StoreDetailResponse>(
    API_ENDPOINTS.store.detail(storeId),
    { params: { demo: DEMO_MODE } },
  );
  return mapStoreDetail(data);
}

// 저장한 장소 목록(`GET /user/store`). 응답은 지도 카드와 같은 StoreCardResponse[]라
// mapStoreCard를 그대로 재사용한다.
export async function getSavedStores(): Promise<Place[]> {
  const { data } = await apiClient.get<StoreCardResponse[]>(
    API_ENDPOINTS.user.savedStores,
    { params: { demo: DEMO_MODE } },
  );
  return data.map(mapStoreCard);
}

// 장소 저장/해제(`POST`/`DELETE /stores/{storeId}/save`). 바디·응답 본문 없음.
// 저장·해제 모두 (user, storeId)로 스코프되므로 어느 공간인지 알려면 demo가 필요하다.
// 저장(POST)은 스웨거에 demo가 있고, 해제(DELETE)는 스웨거에 빠져 있으나 대칭을 맞춰
// 방어적으로 함께 보낸다(백엔드에 DELETE에도 demo 파라미터 추가 요청 필요).
export async function saveStore(storeId: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.store.save(storeId), undefined, {
    params: { demo: DEMO_MODE },
  });
}

export async function unsaveStore(storeId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.store.save(storeId), {
    params: { demo: DEMO_MODE },
  });
}

// 응답엔 placeId가 없어 요청한 storeId로 채운다(목·화면 연결용).
function mapReview(res: ReviewResponse, storeId: string): Review {
  return {
    id: String(res.reviewId),
    placeId: storeId,
    nickname: res.nickname,
    dogAllowed: res.dogAllowed,
    dogSize: res.dogSize === "SMALL_MEDIUM" ? "smallMedium" : "large",
    photoUrl: res.photoUrl ?? null,
    thumbnailUrl: res.thumbnailUrl ?? null,
    content: res.content ?? null,
    tags: res.tags ?? [],
    createdAt: res.createdAt,
    mine: res.mine ?? false,
  };
}

// 거절 완료(S-12) 대체 장소. 응답은 코스 지점과 동일 DTO(CourseStoreResponse[])라
// mapCategory·STATUS_MAP를 재사용한다. DTO에 주소가 없어 location은 비운다(카드에서 숨김).
// 서버는 요청한 size 기준으로 status를 주므로 해당 크기에만 상태를 채운다.
function mapAlternative(res: CourseStoreResponse, size: SizeKey): Place {
  const sizeStatus: Record<SizeKey, PlaceStatus> = {
    smallMedium: "unknown",
    large: "unknown",
  };
  sizeStatus[size] = STATUS_MAP[res.status] ?? "unknown";
  return {
    id: String(res.storeId),
    name: res.name,
    category: mapCategory(res.type),
    location: "",
    latitude: res.lat ?? 0,
    longitude: res.lng ?? 0,
    sizeStatus,
  };
}

// `GET /stores/{storeId}/alternatives`. size(SMALL_MEDIUM/LARGE) 쿼리 필수.
export async function getAlternativeStores(
  storeId: string,
  size: SizeKey,
): Promise<Place[]> {
  const { data } = await apiClient.get<CourseStoreResponse[]>(
    API_ENDPOINTS.store.alternatives(storeId),
    {
      params: {
        size: size === "smallMedium" ? "SMALL_MEDIUM" : "LARGE",
        demo: DEMO_MODE,
      },
    },
  );
  return data.map((item) => mapAlternative(item, size));
}

// 가게 리뷰 목록(상세 최근 리뷰·전체보기). 최신순은 서버 정렬을 따른다.
export async function getStoreReviews(
  storeId: string,
  page = 0,
  size = 20,
): Promise<Review[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(
    API_ENDPOINTS.store.reviews(storeId),
    { params: { page, size, demo: DEMO_MODE } },
  );
  return data.map((review) => mapReview(review, storeId));
}
