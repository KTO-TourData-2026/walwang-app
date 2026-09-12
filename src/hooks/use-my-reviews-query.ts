import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getMyReviewsPage } from "@/api/review";

/** 내 리뷰 페이지 크기. hasNext 판정(받은 수 === size)에 함께 쓴다. */
export const MY_REVIEWS_PAGE_SIZE = 20;

/**
 * 내가 쓴 리뷰 무한스크롤 조회(`GET /user/me/reviews`).
 * 받은 수가 페이지 크기와 같으면 다음 페이지가 있다고 본다(서버에 total이 없음).
 */
export function useMyReviewsQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.user.myReviews(),
    queryFn: ({ pageParam }) =>
      getMyReviewsPage(pageParam, MY_REVIEWS_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === MY_REVIEWS_PAGE_SIZE ? allPages.length : undefined,
  });
}
