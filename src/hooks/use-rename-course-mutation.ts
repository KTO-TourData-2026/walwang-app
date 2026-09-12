import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAndroid } from "react-native";

import { renameCourse } from "@/api/course";
import { queryKeys } from "@/api/query-keys";
import type { SavedCoursePreview } from "@/types/course";

type RenameVariables = { courseId: string; title: string };

/**
 * 코스 이름 변경(`PATCH /user/me/saved-courses/{id}`).
 * 저장 목록 캐시를 낙관적으로 갱신하고 실패 시 되돌린다(장소 저장 토글 패턴 준용).
 */
export function useRenameCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, title }: RenameVariables) =>
      renameCourse(courseId, title),
    onMutate: async ({ courseId, title }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.savedCourses(),
      });
      const previous = queryClient.getQueryData<SavedCoursePreview[]>(
        queryKeys.user.savedCourses(),
      );
      queryClient.setQueryData<SavedCoursePreview[]>(
        queryKeys.user.savedCourses(),
        (old = []) =>
          old.map((item) => (item.id === courseId ? { ...item, title } : item)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.user.savedCourses(),
          context.previous,
        );
      }
      ToastAndroid.show("이름을 바꾸지 못했어요", ToastAndroid.SHORT);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.savedCourses(),
      });
    },
  });
}
