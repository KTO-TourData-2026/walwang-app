import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getCourseDetail, saveCourse } from "@/api/course";
import { queryKeys } from "@/api/query-keys";
import type { Course } from "@/types/course";

/**
 * 코스 저장(`POST /courses`). 응답이 courseId만이라 저장 직후 상세를 프리페치해
 * 저장 탭에서 재진입할 때 즉시 렌더되게 한다. 저장 목록 캐시는 무효화한다.
 */
export function useSaveCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (course: Course) => saveCourse(course),
    onSuccess: async (courseId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.savedCourses(),
      });
      await queryClient.prefetchQuery({
        queryKey: queryKeys.course.detail(courseId),
        queryFn: () => getCourseDetail(courseId),
      });
    },
  });
}
