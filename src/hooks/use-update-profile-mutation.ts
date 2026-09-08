import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { updateMyProfile } from "@/api/user";
import type { UserPatchRequest } from "@/types/user";

// 프로필 수정(`PATCH /user/me`). 성공 시 마이 요약(닉네임 등)을 다시 받도록 무효화한다.
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserPatchRequest) => updateMyProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}
