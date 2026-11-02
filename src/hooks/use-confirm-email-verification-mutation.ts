import { useMutation } from "@tanstack/react-query";

import { confirmEmailVerification } from "@/api/user";

// 이메일 인증번호 확인. [확인] 버튼에서 호출한다. data=verificationToken(회원가입에 동봉).
export function useConfirmEmailVerificationMutation() {
  return useMutation({ mutationFn: confirmEmailVerification });
}
