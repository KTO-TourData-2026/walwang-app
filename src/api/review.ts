import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { mapCategory } from "@/api/store";
import type {
  MyReview,
  MyReviewResponse,
  ReviewReportRequest,
} from "@/types/review";

// review 도메인 단일 호출 함수. 서버 원본을 이 파일(경계)에서 앱 타입으로 매핑한다.

// 데모 기간에는 조회에 demo=true를 붙인다(store 도메인과 동일 규약).
const DEMO_MODE = true;

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
    { params: { page, size, demo: DEMO_MODE } },
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
