// 마이(플로우 D) API 스펙 초안 — `GET /user/me`, `/user/me/passport`(+`/{id}`).
// 임의로 바꾸지 말 것: 백엔드 담당과 먼저 합의한다.

export interface UserSummary {
  nickname: string;
  reviewCount: number;
  /** 모은 도장 수(= 여권 도장 개수에서 파생). */
  stampCount: number;
}

// 목록(`/user/me/passport`)·상세(`/{id}`) 응답에서 UI가 쓰는 필드를 합친 형태.
export interface PassportStamp {
  id: string;
  storeId: string;
  storeName: string;
  stampUrl: string | null;
  /** 원본 사진. 세그멘테이션 미달 시 null → 실루엣 폴백. */
  photoUrl: string | null;
  createdAt: string;
}
