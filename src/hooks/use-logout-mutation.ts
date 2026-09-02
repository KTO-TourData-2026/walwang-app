import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { logout } from "@/api/user";

// 로그아웃. logout()이 서버 호출 성공/실패와 무관하게 토큰을 정리한다(api/user.ts의 finally).
// 성공 시 캐시된 user 쿼리를 제거해 로그아웃 상태에서 재조회(401)를 막는다.
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
    },
  });
}
