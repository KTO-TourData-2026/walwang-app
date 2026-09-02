import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { logout } from "@/api/user";

// 로그아웃. logout()이 서버 호출 성공/실패와 무관하게 토큰을 정리한다(api/user.ts의 finally).
// 토큰이 항상 정리되므로 캐시도 성공/실패 무관하게(onSettled) 제거해 이전 사용자 데이터 재사용을 막는다.
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
    },
  });
}
