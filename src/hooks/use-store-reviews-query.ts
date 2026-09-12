import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getStoreReviews } from "@/api/store";

/** 리뷰 페이지 크기. hasNext 판정(받은 수 === size)에 함께 쓴다. */
export const REVIEWS_PAGE_SIZE = 20;

/**
 * 가게 리뷰 무한스크롤 조회.
 * 받은 수가 페이지 크기와 같으면 다음 페이지가 있다고 본다(서버에 total이 없음).
 * 상세의 "최근 리뷰"는 첫 페이지 일부만, 전체보기는 모든 페이지를 이어붙여 쓴다.
 */
export function useStoreReviewsQuery(storeId: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.store.reviews(storeId ?? ""),
    queryFn: ({ pageParam }) =>
      getStoreReviews(storeId as string, pageParam, REVIEWS_PAGE_SIZE),
    enabled: Boolean(storeId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === REVIEWS_PAGE_SIZE ? allPages.length : undefined,
  });
}
