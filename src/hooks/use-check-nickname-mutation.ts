import { useMutation } from "@tanstack/react-query";

import { checkNicknameAvailable } from "@/api/user";

// 닉네임 중복 확인. [중복 확인] 버튼에서 호출한다. data=true(사용 가능)/false(중복).
export function useCheckNicknameMutation() {
  return useMutation({ mutationFn: checkNicknameAvailable });
}
