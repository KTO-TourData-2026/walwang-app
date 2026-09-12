import { useQuery } from "@tanstack/react-query";

import { getSavedCourses } from "@/api/course";
import { queryKeys } from "@/api/query-keys";

// 저장한 코스 목록(저장 탭 코스 탭). 저장/이름변경/삭제 뮤테이션이 이 캐시를 공유·무효화한다.
export function useSavedCoursesQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.user.savedCourses(),
    queryFn: getSavedCourses,
    enabled: options.enabled ?? true,
  });
}
