import { useMutation } from "@tanstack/react-query";

import { verifyReceipt } from "@/api/review";

type VerifyReceiptVariables = {
  storeId: string;
  imageUri: string;
};

/**
 * 영수증 인증(`POST /reviews/receipt-verify`) 뮤테이션.
 * 통과 시 receiptToken을 돌려주며, 화면에서 드래프트(receipt.token)에 저장한다.
 */
export function useVerifyReceiptMutation() {
  return useMutation({
    mutationFn: ({ storeId, imageUri }: VerifyReceiptVariables) =>
      verifyReceipt(storeId, imageUri),
  });
}
