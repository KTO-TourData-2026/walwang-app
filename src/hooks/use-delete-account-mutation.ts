import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteUser } from "@/api/user";

// 회원 탈퇴(`DELETE /user/me`). deleteUser가 성공 시 토큰을 정리한다(api/user.ts).
// 탈퇴가 끝나면 캐시를 통째로 비워 이전 사용자 데이터 재사용을 막는다.
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
