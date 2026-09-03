/**
 * 리뷰 API 응답 스펙(프론트 사용 형태).
 * `GET /stores/{storeId}/reviews` 응답을 camelCase로 매핑한다.
 * - placeId: 목 데이터 연결용(실제 리뷰 응답엔 없음, 경로 파라미터로 전달됨).
 * - tags: 리뷰별 해시태그. 백엔드 응답 추가 요청 중(현재 스펙 미포함).
 * 임의로 바꾸지 말 것 — 바꾸려면 백엔드 담당과 먼저 합의한다.
 */
import type { Category, SizeKey } from "@/types/place";

// 서버 응답 DTO(`GET /stores/{storeId}/reviews`의 ReviewResponse). 경계에서 Review로 매핑한다.
// placeId는 응답에 없어 경로 파라미터(storeId)로 채운다.
export interface ReviewResponse {
  reviewId: string;
  nickname: string;
  dogAllowed: boolean;
  dogSize: "SMALL_MEDIUM" | "LARGE";
  photoUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  content: string | null;
  createdAt: string;
  mine: boolean;
}

export interface Review {
  id: string;
  placeId: string;
  nickname: string;
  /** true=들어갔어요, false=거절당했어요 */
  dogAllowed: boolean;
  dogSize: SizeKey;
  /** 거절 리뷰는 사진이 없다 → null */
  photoUrl: string | null;
  thumbnailUrl: string | null;
  /** 자유 텍스트(선택 입력) */
  content: string | null;
  /** 해시태그 이름 목록(사전 정의 목록에서). 없으면 빈 배열. */
  tags: string[];
  /** ISO 8601 */
  createdAt: string;
  mine: boolean;
}

// 서버 응답 DTO(`GET /user/me/reviews`의 MyReviewResponse). 경계에서 MyReview로 매핑한다.
// 가게 리뷰(ReviewResponse)와 달리 store 정보(storeId·storeName·type)를 직접 내려주고,
// nickname·content·tags·mine은 없다(항상 본인 리뷰).
export interface MyReviewResponse {
  reviewId: string;
  storeId: string;
  storeName: string;
  type: string;
  dogAllowed: boolean;
  dogSize: "SMALL_MEDIUM" | "LARGE";
  photoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

// 내가 쓴 리뷰(마이 리뷰 목록 아이템). store 정보를 응답에서 직접 받아 목 place 조회가 필요 없다.
export interface MyReview {
  id: string;
  storeId: string;
  storeName: string;
  category: Category;
  dogAllowed: boolean;
  dogSize: SizeKey;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

// 리뷰 신고 요청 바디(`POST /reviews/{reviewId}/reports`의 ReviewReportRequest).
export interface ReviewReportRequest {
  /** 신고 사유(50자 이내). */
  reason: string;
}
