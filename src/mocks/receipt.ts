import type { Place } from "@/types/place";

/**
 * 영수증 OCR 인증(S-06)의 목 판정. 실제로는 `POST /reviews/receipt-verify`가
 * 상호명 유사도로 판정한다. 응답 형태는 `ReceiptVerifyResult`에 맞췄다.
 * 실연동 시 이 파일만 교체. `outcome`은 세 분기를 강제하기 위한 목 전용 인자다.
 */

export type ReceiptOutcome = "verified" | "mismatch" | "unreadable";

/** `POST /reviews/receipt-verify` 응답(프론트 사용 형태). */
export interface ReceiptVerifyResult {
  verified: boolean;
  /** 통과 시 null, 실패 시 사유 코드("NAME_MISMATCH" 등). */
  reason: string | null;
  /** OCR로 읽은 상호명. 판독 실패 시 null. */
  matchedName: string | null;
  /** 0.0 ~ 1.0 */
  similarity: number;
  /** 통과 시에만 발급(30분 만료). 실패 시 null. */
  receiptToken: string | null;
}

function nearbyWrongName(place: Place): string {
  const base = place.name.split(" ")[0] ?? place.name;
  return `${base} 베이커리`;
}

export function mockVerifyReceipt(
  place: Place,
  outcome: ReceiptOutcome = "verified",
): ReceiptVerifyResult {
  switch (outcome) {
    case "mismatch":
      return {
        verified: false,
        reason: "NAME_MISMATCH",
        matchedName: nearbyWrongName(place),
        similarity: 0.31,
        receiptToken: null,
      };
    case "unreadable":
      return {
        verified: false,
        reason: "OCR_FAILED",
        matchedName: null,
        similarity: 0,
        receiptToken: null,
      };
    case "verified":
    default:
      return {
        verified: true,
        reason: null,
        matchedName: place.name,
        similarity: 0.97,
        receiptToken: `mock-receipt-${place.id}`,
      };
  }
}
