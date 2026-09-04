import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAndroid } from "react-native";

import { deleteCourse } from "@/api/course";
import { queryKeys } from "@/api/query-keys";
import type { SavedCoursePreview } from "@/types/course";

/**
 * 코스 삭제(`DELETE /course/{id}`).
 * 저장 목록 캐시에서 낙관적으로 제거하고 실패 시 되돌린다(장소 저장 토글 패턴 준용).
 */
export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.savedCourses(),
      });
      const previous = queryClient.getQueryData<SavedCoursePreview[]>(
        queryKeys.user.savedCourses(),
      );
      queryClient.setQueryData<SavedCoursePreview[]>(
        queryKeys.user.savedCourses(),
        (old = []) => old.filter((item) => item.id !== courseId),
      );
      return { previous };
    },
    onSuccess: () => {
      ToastAndroid.show("코스를 삭제했어요", ToastAndroid.SHORT);
    },
    onError: (_error, _courseId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.user.savedCourses(),
          context.previous,
        );
      }
      ToastAndroid.show("삭제하지 못했어요", ToastAndroid.SHORT);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.savedCourses(),
      });
    },
  });
}
