import { useQuery } from "@tanstack/react-query";

import { recommendCourse } from "@/api/course";
import { queryKeys } from "@/api/query-keys";
import type { CourseRecommendRequest } from "@/types/course";

// 화면 단 훅: 코스 추천(`POST /courses/recommend`). request가 있을 때만 호출한다.
// 추천 결과는 세션 내 재생성을 막아(staleTime: Infinity) 뒤로가기 후 재진입해도 같은 코스를 보인다.
export function useRecommendCourseQuery(
  request: CourseRecommendRequest | null,
) {
  return useQuery({
    queryKey: request
      ? queryKeys.course.recommend(request)
      : ["course", "recommend", "idle"],
    queryFn: () => recommendCourse(request as CourseRecommendRequest),
    enabled: request !== null,
    staleTime: Infinity,
  });
}
