import { useMutation } from "@tanstack/react-query";

import { sendEmailVerification } from "@/api/user";

// 이메일 인증번호 발송. [인증하기]·[재전송] 버튼에서 호출한다. 에러는 화면에서 상태코드로 분기.
export function useSendEmailVerificationMutation() {
  return useMutation({ mutationFn: sendEmailVerification });
}
