import { useMutation } from "@tanstack/react-query";

import { reportReview } from "@/api/review";

type ReportReviewVariables = {
  reviewId: string;
  reason: string;
};

/**
 * 리뷰 신고(`POST /reviews/{reviewId}/reports`) 뮤테이션.
 * 성공(201) 시 바디가 없어 캐시 변경은 없고, 화면에서 접수 안내만 한다.
 */
export function useReportReviewMutation() {
  return useMutation({
    mutationFn: ({ reviewId, reason }: ReportReviewVariables) =>
      reportReview(reviewId, reason),
  });
}
