import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { createReview, type CreateReviewInput } from "@/api/review";

/**
 * 리뷰 등록(`POST /reviews`) 뮤테이션. 성공 시 도장·카운트·가게 상태가 바뀌므로
 * 여권·프로필·해당 가게 상세/리뷰 캐시를 무효화한다.
 */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (_data, input) => {
      // user 전체(여권·프로필 도장수·내 리뷰) 재조회.
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.store.detail(input.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.store.reviews(input.storeId),
      });
    },
  });
}
