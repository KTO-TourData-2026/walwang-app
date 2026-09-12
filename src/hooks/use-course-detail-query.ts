import { useQuery } from "@tanstack/react-query";

import { getCourseDetail } from "@/api/course";
import { queryKeys } from "@/api/query-keys";

// 화면 단 훅: 코스 상세(`GET /courses/{id}`). 저장 코스 재진입(S-15→S-11) 시 사용.
export function useCourseDetailQuery(
  courseId: string | null | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.course.detail(courseId ?? ""),
    queryFn: () => getCourseDetail(courseId as string),
    enabled: Boolean(courseId) && (options.enabled ?? true),
  });
}
