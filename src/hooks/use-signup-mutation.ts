import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { login, signUp } from "@/api/user";
import type { UserSignUpRequest } from "@/types/user";

// 회원가입 → 자동 로그인(S-03). signUp은 토큰을 안 주므로 같은 자격증명으로 login을 이어 호출한다.
// 성공 시 토큰이 저장되므로 user 관련 쿼리를 무효화해 재조회하게 한다.
export function useSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserSignUpRequest) => {
      await signUp(body);
      await login({ email: body.email, password: body.password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
