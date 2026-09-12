import { useMutation } from "@tanstack/react-query";

import { checkEmailAvailable } from "@/api/user";

// 이메일 중복 확인. [중복 확인] 버튼에서 호출한다. data=true(사용 가능)/false(중복).
export function useCheckEmailMutation() {
  return useMutation({ mutationFn: checkEmailAvailable });
}
