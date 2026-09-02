import {
  apiClient,
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { ApiHttpError } from "@/api/http-error";
import type {
  UserLoginRequest,
  UserProfileResponse,
  UserSummary,
} from "@/types/user";

// user 도메인 단일 호출 함수. 다른 도메인(store/review/course)도 이 파일을 본떠 추가한다.

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
  const { data } = await apiClient.get<UserProfileResponse>(
    API_ENDPOINTS.user.me,
  );
  return {
    nickname: data.nickname,
    reviewCount: data.reviewCount,
    stampCount: data.stampCount,
  };
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
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
