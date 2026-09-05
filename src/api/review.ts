import { File, Paths } from "expo-file-system";

import { apiClient } from "@/api/client";
import { getDemoMode } from "@/api/demo";
import { API_ENDPOINTS } from "@/api/endpoints";
import { mapCategory } from "@/api/store";
import type { Hashtag } from "@/constants/hashtags";
import type { SizeKey } from "@/types/place";
import type {
  MyReview,
  MyReviewResponse,
  ReceiptVerifyResponse,
  ReviewCreateRequest,
  ReviewCreateResponse,
  ReviewReportRequest,
  ReviewTag,
} from "@/types/review";

// review 도메인 단일 호출 함수. 서버 원본을 이 파일(경계)에서 앱 타입으로 매핑한다.

// 한글 해시태그(HASHTAGS) → 서버 enum. 리뷰 등록 시 이 표로 변환해 보낸다.
const HASHTAG_TO_REVIEW_TAG: Record<Hashtag, ReviewTag> = {
  넓은마당: "WIDE_YARD",
  펜스완비: "FENCED",
  잔디밭: "LAWN",
  뛰놀기좋아요: "GOOD_FOR_PLAY",
  반려견전용공간: "DOG_ONLY_AREA",
  테라스넓음: "SPACIOUS_TERRACE",
  주차편해요: "EASY_PARKING",
  급수대있음: "WATER_STATION",
  배변봉투제공: "POOP_BAGS",
  강아지방석: "DOG_CUSHION",
  반려견메뉴: "DOG_MENU",
  강아지식기제공: "DOG_BOWL",
  조용해요: "QUIET",
  한적해요: "NOT_CROWDED",
  소심견도편해요: "SHY_DOG_FRIENDLY",
  친구들많아요: "MANY_DOG_FRIENDS",
  첫나들이추천: "GOOD_FIRST_OUTING",
  오래머물기좋아요: "GOOD_FOR_LONG_STAY",
  목줄필요해요: "LEASH_REQUIRED",
};

// RN FormData의 파일 파트 형태. axios가 이 shape의 Content-Type을 그대로 파트 헤더로 쓴다.
interface FilePart {
  uri: string;
  name: string;
  type: string;
}

// 로컬 이미지 URI를 파일 파트로. 확장자로 MIME을 추정하고 기본은 image/jpeg.
function imageFilePart(uri: string, name: string): FilePart {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "";
  const type =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "heic"
          ? "image/heic"
          : "image/jpeg";
  return { uri, name: `${name}.${ext || "jpg"}`, type };
}

// JSON 객체를 캐시에 임시 파일로 써서 application/json 파일 파트로 만든다.
// (RN FormData는 문자열 파트에 Content-Type을 못 붙여 Spring @RequestPart가 파싱하지 못한다.)
function jsonFilePart(name: string, body: unknown): FilePart {
  const file = new File(Paths.cache, `walwang-${name}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(body));
  return { uri: file.uri, name, type: "application/json" };
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" };

// 내가 쓴 리뷰(`GET /user/me/reviews`)는 store 정보를 직접 내려주므로 목 place 조회가 필요 없다.
function mapMyReview(res: MyReviewResponse): MyReview {
  return {
    id: String(res.reviewId),
    storeId: String(res.storeId),
    storeName: res.storeName,
    category: mapCategory(res.type),
    dogAllowed: res.dogAllowed,
    dogSize: res.dogSize === "SMALL_MEDIUM" ? "smallMedium" : "large",
    photoUrl: res.photoUrl ?? null,
    thumbnailUrl: res.thumbnailUrl ?? null,
    createdAt: res.createdAt,
  };
}

// 내 리뷰 목록. 받은 수가 size와 같으면 다음 페이지가 있다고 본다(서버에 total 없음).
export async function getMyReviewsPage(
  page = 0,
  size = 20,
): Promise<MyReview[]> {
  const { data } = await apiClient.get<MyReviewResponse[]>(
    API_ENDPOINTS.user.myReviews,
    { params: { page, size, demo: getDemoMode() } },
  );
  return data.map(mapMyReview);
}

// 리뷰 삭제(마이 리뷰·가게 전체리뷰 공통). 성공 시 바디 없음.
export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.review.detail(reviewId));
}

// 리뷰 신고. 성공(201) 시 바디 없음.
export async function reportReview(
  reviewId: string,
  reason: string,
): Promise<void> {
  const body: ReviewReportRequest = { reason };
  await apiClient.post(API_ENDPOINTS.review.reports(reviewId), body);
}

// 영수증 OCR 인증(`POST /reviews/receipt-verify`). 쿼리는 store_id(스네이크케이스 — 다른 API와 다름).
// 통과 시 receiptToken을 발급하며, 리뷰 등록의 receiptToken으로 전달한다.
export async function verifyReceipt(
  storeId: string,
  imageUri: string,
): Promise<ReceiptVerifyResponse> {
  const form = new FormData();
  // RN FormData는 { uri, name, type } 파일 파트를 받는다(웹 File 아님).
  form.append("receipt", imageFilePart(imageUri, "receipt") as unknown as Blob);
  const { data } = await apiClient.post<ReceiptVerifyResponse>(
    API_ENDPOINTS.review.receiptVerify,
    form,
    {
      params: { store_id: storeId, demo: getDemoMode() },
      headers: MULTIPART_HEADERS,
    },
  );
  return data;
}

// 리뷰 등록 입력(드래프트 → 요청). 태그는 한글, 사진은 로컬 URI로 받아 경계에서 변환한다.
export interface CreateReviewInput {
  storeId: string;
  dogAllowed: boolean;
  dogSize: SizeKey;
  content: string;
  tags: string[];
  receiptToken?: string | null;
  photoUri?: string | null;
}

// 리뷰 등록(`POST /reviews`). multipart: data(JSON 파트) + photo(파일 파트, 선택).
export async function createReview(
  input: CreateReviewInput,
): Promise<ReviewCreateResponse> {
  const tags = input.tags
    .map((tag) => HASHTAG_TO_REVIEW_TAG[tag as Hashtag])
    .filter((tag): tag is ReviewTag => Boolean(tag));

  const body: ReviewCreateRequest = {
    storeId: input.storeId,
    dogAllowed: input.dogAllowed,
    dogSize: input.dogSize === "smallMedium" ? "SMALL_MEDIUM" : "LARGE",
    ...(input.content.trim() ? { content: input.content.trim() } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(input.receiptToken ? { receiptToken: input.receiptToken } : {}),
  };

  const form = new FormData();
  form.append("data", jsonFilePart("data", body) as unknown as Blob);
  if (input.photoUri) {
    form.append(
      "photo",
      imageFilePart(input.photoUri, "photo") as unknown as Blob,
    );
  }

  const { data } = await apiClient.post<ReviewCreateResponse>(
    API_ENDPOINTS.review.base,
    form,
    { params: { demo: getDemoMode() }, headers: MULTIPART_HEADERS },
  );
  return data;
}
