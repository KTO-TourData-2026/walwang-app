// 마이(플로우 D) API 스펙 초안 — `GET /user/me`, `/user/me/passport`(+`/{id}`).
// 임의로 바꾸지 말 것: 백엔드 담당과 먼저 합의한다.

export interface UserSummary {
  nickname: string;
  reviewCount: number;
  /** 모은 도장 수(= 여권 도장 개수에서 파생). */
  stampCount: number;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

// 약관 코드(swagger AgreementRequest.termCode enum).
export type TermCode = "TERMS_OF_SERVICE" | "PRIVACY" | "AGE_14";

export interface AgreementRequest {
  termCode: TermCode;
  agreed: boolean;
}

// 회원가입 요청(swagger SignUpRequest). 성공 시 바디·토큰 없음(200) → 이어서 login 호출.
export interface UserSignUpRequest {
  email: string;
  nickname: string;
  password: string;
  agreements: AgreementRequest[];
}

// `GET /user/me` 서버 응답(swagger UserProfileResponse, camelCase).
export interface UserProfileResponse {
  userId: number;
  email: string;
  nickname: string;
  reviewCount: number;
  stampCount: number;
  savedStoreCount: number;
}

// 도장 생성 상태(swagger PassportStatus enum). READY=stampUrl 렌더,
// PENDING=생성 중(발도장 폴백), FALLBACK=세그멘테이션 미달(실루엣 폴백).
export type PassportServerStatus = "PENDING" | "READY" | "FALLBACK";

// `GET /user/me/passport` 목록 한 건(PassportSummaryResponse). storeName·photoUrl·storeId 없음 — 상세에만 있다.
export interface PassportSummaryResponse {
  id: string;
  stampUrl: string | null;
  status: PassportServerStatus;
  createdAt: string;
}

// `GET /user/me/passport/{passportId}` 상세(PassportDetailResponse). 목록 필드 + 가게·원본사진.
export interface PassportDetailResponse {
  id: string;
  storeId: string;
  reviewId: string;
  stampUrl: string | null;
  status: PassportServerStatus;
  /** 원본 사진. 세그멘테이션 미달 시 null → 실루엣 폴백. */
  photoUrl: string | null;
  storeName: string;
  createdAt: string;
}

// 앱 도장 상태(서버 enum과 1:1, 경계에서 매핑).
export type PassportStatus = "pending" | "ready" | "fallback";

// 여권 목록 아이템(앱 형태). 책 도장은 stampUrl·status만으로 렌더한다(가게 정보 없음).
export interface PassportSummary {
  id: string;
  stampUrl: string | null;
  status: PassportStatus;
  createdAt: string;
}

// 여권 도장 상세(앱 형태). 목록 요약 + 가게·원본사진(상세 탭 시 채운다).
export interface PassportStamp {
  id: string;
  storeId: string;
  storeName: string;
  stampUrl: string | null;
  status: PassportStatus;
  /** 원본 사진. 세그멘테이션 미달 시 null → 실루엣 폴백. */
  photoUrl: string | null;
  createdAt: string;
}
