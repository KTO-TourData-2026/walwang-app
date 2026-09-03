import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
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
};

// 이미 경고한 type은 다시 안 찍는다(가게 수백 개면 같은 경고가 도배됨).
const warnedTypes = new Set<string>();

function mapCategory(type: string): Category {
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
  return {
    id: String(res.storeId),
    name: res.name,
    category: mapCategory(res.type),
    location: res.address,
    latitude: res.geog?.lat ?? 0,
    longitude: res.geog?.lng ?? 0,
    sizeStatus: foldSizeStatus(res.sizeStatus),
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

// 데모 기간에는 모든 store 조회에 demo=true를 붙여 시연용 데이터를 받는다.
// 데모가 끝나면 이 한 줄만 false로 끄면 된다(courses 등 다른 도메인은 별도).
const DEMO_MODE = true;

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
  };
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
