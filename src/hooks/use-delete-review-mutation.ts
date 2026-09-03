import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { deleteReview } from "@/api/review";

type DeleteReviewVariables = {
  reviewId: string;
  /** 가게 전체리뷰에서 삭제할 때만 전달 — 해당 가게 리뷰·상세 캐시를 함께 무효화한다. */
  storeId?: string;
};

/**
 * 리뷰 삭제(`DELETE /reviews/{reviewId}`) 뮤테이션. 마이 리뷰·가게 전체리뷰 공통.
 * 성공 시 내 리뷰 목록을 무효화하고, storeId가 오면 그 가게 리뷰·상세도 무효화한다.
 * (마이 리뷰 화면은 즉시 반영을 위해 낙관적 제거를 별도로 수행한다.)
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: DeleteReviewVariables) => deleteReview(reviewId),
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.myReviews() });
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.store.reviews(storeId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.store.detail(storeId),
        });
      }
    },
  });
}
