import {
  apiClient,
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/api/client";
import { getDemoMode } from "@/api/demo";
import { API_ENDPOINTS } from "@/api/endpoints";
import { ApiHttpError } from "@/api/http-error";
import type {
  EmailVerificationConfirmRequest,
  EmailVerificationConfirmResponse,
  PassportDetailResponse,
  PassportServerStatus,
  PassportStamp,
  PassportStatus,
  PassportSummary,
  PassportSummaryResponse,
  RefreshTokenResponse,
  UserLoginRequest,
  UserPatchRequest,
  UserProfileResponse,
  UserSignUpRequest,
  UserSummary,
} from "@/types/user";

const PASSPORT_STATUS_MAP: Record<PassportServerStatus, PassportStatus> = {
  PENDING: "pending",
  READY: "ready",
  FALLBACK: "fallback",
};

// user 도메인 단일 호출 함수. 다른 도메인(store/review/course)도 이 파일을 본떠 추가한다.

// 회원가입: 성공(200) 시 바디·토큰이 없다 → 화면에서 이어서 login을 호출해 자동 로그인한다.
// 이메일/닉네임이 이미 있으면 409가 온다(경계는 그대로 던지고 화면에서 인라인 처리).
// verificationToken(이메일 인증 확인 응답)이 없으면 400, 만료·무효·재사용이면 403.
export async function signUp(body: UserSignUpRequest): Promise<void> {
  await apiClient.post(API_ENDPOINTS.user.signUp, body);
}

// 이메일 인증번호 발송(`POST /user/email-verification/send`). 성공 시 바디 없음(200).
// 형식 오류 400·이미 가입된 이메일 409·1분 내 재요청 429는 ApiHttpError로 그대로 던진다(화면에서 인라인 처리).
export async function sendEmailVerification(email: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.user.emailVerificationSend, { email });
}

// 이메일 인증번호 확인(`POST /user/email-verification/confirm`). 성공 시 verificationToken을 돌려준다.
// 코드 불일치·만료는 ApiHttpError로 그대로 던진다. 200인데 토큰이 없으면 가입에 쓸 수 없으니 실패 처리.
export async function confirmEmailVerification(
  body: EmailVerificationConfirmRequest,
): Promise<string> {
  const { data } = await apiClient.post<EmailVerificationConfirmResponse>(
    API_ENDPOINTS.user.emailVerificationConfirm,
    body,
  );
  if (!data?.verificationToken) {
    throw new ApiHttpError(0, "이메일 인증 응답에 토큰이 없어요.");
  }
  return data.verificationToken;
}

// 닉네임 중복 확인: 사용 가능이면 true, 중복(409)이면 false.
export async function checkNicknameAvailable(
  nickname: string,
): Promise<boolean> {
  try {
    await apiClient.get(API_ENDPOINTS.user.checkNickname, {
      params: { nickname },
    });
    return true;
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 409) {
      return false;
    }
    throw error;
  }
}

// 로그인: access는 응답 헤더(Authorization), refresh는 바디로 온다.
export async function login(body: UserLoginRequest): Promise<void> {
  const res = await apiClient.post<{ refreshToken: string }>(
    API_ENDPOINTS.user.login,
    body,
  );
  const auth = res.headers.authorization ?? res.headers.Authorization;
  const access =
    typeof auth === "string" ? auth.replace(/^Bearer\s+/i, "") : null;
  const refreshToken = res.data?.refreshToken;

  // access(헤더)·refresh(바디) 둘 다 있어야 로그인 성공 — 하나라도 없으면 실패 처리.
  if (!access || !refreshToken) {
    throw new ApiHttpError(0, "로그인 응답에 토큰이 없어요.");
  }

  await setAccessToken(access);
  await setRefreshToken(refreshToken);
}

// 내 정보. swagger 응답이 camelCase(UserProfileResponse)라 필요한 필드만 추린다.
export async function getMyProfile(): Promise<UserSummary> {
  // 현재 모드(demo)를 붙여 리뷰 목록·여권과 같은 공간의 개수를 받는다(모드가 다르면 서로 0).
  const { data } = await apiClient.get<UserProfileResponse>(
    API_ENDPOINTS.user.me,
    { params: { demo: getDemoMode() } },
  );
  return {
    nickname: data.nickname,
    reviewCount: data.reviewCount,
    stampCount: data.stampCount,
  };
}

// 내 정보 수정(`PATCH /user/me`). nickname은 항상, 비번 변경 시 pastPassword+newPassword를 보낸다.
// 성공 시 서버가 refresh를 회전시켜 새 refreshToken을 준다 → 저장한다(옛 refresh로 재발급 방지).
// access는 응답에 없다. 비번 변경으로 기존 access가 무효화되면 다음 401에서 새 refresh로 재발급된다.
export async function updateMyProfile(body: UserPatchRequest): Promise<void> {
  const { data } = await apiClient.patch<RefreshTokenResponse>(
    API_ENDPOINTS.user.me,
    body,
  );
  // refresh가 없으면 저장 성공으로 볼 수 없다(옛 refresh 유지 시 이후 재발급 실패) → login/reissue처럼 던진다.
  if (!data?.refreshToken) {
    throw new ApiHttpError(0, "프로필 수정 응답에 토큰이 없어요.");
  }
  await setRefreshToken(data.refreshToken);
}

export async function logout(): Promise<void> {
  // refresh 읽기 실패까지 포함해 어떤 경로로 끝나도 토큰은 정리한다(남은 토큰으로 자동 로그인 방지).
  try {
    const refreshToken = await getRefreshToken();
    await apiClient.post(API_ENDPOINTS.user.logout, { refreshToken });
  } finally {
    await clearTokens();
  }
}

export async function deleteUser(): Promise<void> {
  // 탈퇴가 성공한 뒤에만 토큰을 지운다(실패 시 계정은 남아있으므로 로그인 유지).
  await apiClient.delete(API_ENDPOINTS.user.me);
  await clearTokens();
}

// 여권 도장 목록(`GET /user/me/passport`). storeName·photoUrl 없이 stampUrl·status만 온다.
// size 상한은 10(swagger). 책 도장은 status 3분기로 렌더한다.
export async function getPassport(
  page = 0,
  size = 10,
): Promise<PassportSummary[]> {
  const { data } = await apiClient.get<PassportSummaryResponse[]>(
    API_ENDPOINTS.user.passport,
    { params: { page, size, demo: getDemoMode() } },
  );
  return data.map((item) => ({
    id: String(item.id),
    stampUrl: item.stampUrl ?? null,
    status: PASSPORT_STATUS_MAP[item.status] ?? "pending",
    createdAt: item.createdAt,
  }));
}

// 여권 도장 상세(`GET /user/me/passport/{id}`). 가게·원본사진을 여기서 받아 채운다.
export async function getPassportDetail(
  passportId: string,
): Promise<PassportStamp> {
  const { data } = await apiClient.get<PassportDetailResponse>(
    API_ENDPOINTS.user.passportDetail(passportId),
    { params: { demo: getDemoMode() } },
  );
  return {
    id: String(data.id),
    storeId: String(data.storeId),
    storeName: data.storeName,
    stampUrl: data.stampUrl ?? null,
    status: PASSPORT_STATUS_MAP[data.status] ?? "pending",
    photoUrl: data.photoUrl ?? null,
    createdAt: data.createdAt,
  };
}
