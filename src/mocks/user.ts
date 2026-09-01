import { MOCK_PLACES } from "@/mocks/places";
import { getMyReviews } from "@/mocks/reviews";
import type { PassportStamp, UserSummary } from "@/types/user";

// 마이(플로우 D) 화면 개발용 목. 리뷰수·도장수는 getMyReviews에서 파생(화면 간 일관).
// 실연동 시 이 파일만 지우면 되도록 User 외의 타입을 만들지 말 것.

const storeName = (placeId: string) =>
  MOCK_PLACES.find((place) => place.id === placeId)?.name ?? "";

// 도장은 "들어갔어요" 리뷰에서만 생성(거절은 사진 없어 미지급).
export const MOCK_PASSPORT: PassportStamp[] = getMyReviews()
  .filter((review) => review.dogAllowed)
  .map((review) => ({
    id: `st-${review.id}`,
    storeId: review.placeId,
    storeName: storeName(review.placeId),
    stampUrl: null,
    // r-010은 원본 사진 없이 실루엣만 크게 나오는 폴백 케이스로 둔다.
    photoUrl: review.id === "r-010" ? null : review.photoUrl,
    createdAt: review.createdAt,
  }));

export const MOCK_USER: UserSummary = {
  nickname: "나영",
  reviewCount: getMyReviews().length,
  stampCount: MOCK_PASSPORT.length,
};

export function getStamp(id: string): PassportStamp | undefined {
  return MOCK_PASSPORT.find((stamp) => stamp.id === id);
}
