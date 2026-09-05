import { create } from "zustand";

import type { SizeKey } from "@/types/place";

/**
 * 리뷰 작성 플로우의 화면 간 공유 드래프트(zustand).
 * 등록 시 이 값들이 `POST /reviews`(data 파트)의
 * dogAllowed·dogSize·tags·content·receiptToken으로 매핑된다(경계: api/review.ts).
 */

/** `dog_allowed`(true=들어갔어요 / false=거절당했어요)와 1:1. */
export type ReviewResult = "allowed" | "denied";

interface ReceiptDraft {
  verified: boolean;
  imageUri: string | null;
  matchedName: string | null;
  /** `POST /reviews/receipt-verify` 통과 시 발급되는 토큰. */
  token: string | null;
}

interface ReviewDraftState {
  placeId: string | null;
  result: ReviewResult | null;
  receipt: ReceiptDraft;
  photoUri: string | null;
  size: SizeKey | null;
  tags: string[];
  content: string;
  /** 등록(`POST /reviews`) 응답으로 온 도장 이미지 URL. 완료 화면에서 렌더한다(없으면 폴백). */
  stampUrl: string | null;

  begin: (placeId: string) => void;
  /** 결과 변경 시 영수증·사진 초기화(재입력 필요). */
  setResult: (result: ReviewResult) => void;
  setReceipt: (patch: Partial<ReceiptDraft>) => void;
  resetReceipt: () => void;
  setPhotoUri: (uri: string | null) => void;
  setSize: (size: SizeKey) => void;
  toggleTag: (tag: string) => void;
  setContent: (content: string) => void;
  setStampUrl: (url: string | null) => void;
  reset: () => void;
}

const EMPTY_RECEIPT: ReceiptDraft = {
  verified: false,
  imageUri: null,
  matchedName: null,
  token: null,
};

const INITIAL: Pick<
  ReviewDraftState,
  | "placeId"
  | "result"
  | "receipt"
  | "photoUri"
  | "size"
  | "tags"
  | "content"
  | "stampUrl"
> = {
  placeId: null,
  result: null,
  receipt: EMPTY_RECEIPT,
  photoUri: null,
  size: null,
  tags: [],
  content: "",
  stampUrl: null,
};

export const useReviewDraft = create<ReviewDraftState>((set) => ({
  ...INITIAL,

  begin: (placeId) => set({ ...INITIAL, placeId }),

  setResult: (result) =>
    set((state) => {
      if (state.result === result) {
        return { result };
      }
      return { result, receipt: EMPTY_RECEIPT, photoUri: null };
    }),

  setReceipt: (patch) =>
    set((state) => ({ receipt: { ...state.receipt, ...patch } })),

  resetReceipt: () => set({ receipt: EMPTY_RECEIPT }),

  setPhotoUri: (photoUri) => set({ photoUri }),

  setSize: (size) => set({ size }),

  toggleTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag)
        ? state.tags.filter((item) => item !== tag)
        : [...state.tags, tag],
    })),

  setContent: (content) => set({ content }),

  setStampUrl: (stampUrl) => set({ stampUrl }),

  reset: () => set({ ...INITIAL }),
}));
