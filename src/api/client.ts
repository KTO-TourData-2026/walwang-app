import axios, { type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

import { toApiHttpError } from "@/api/http-error";

/**
 * [환경변수 함정] RN에는 process.env가 없다.
 * Expo가 번들 타임에 EXPO_PUBLIC_ 접두사가 붙은 값만 문자열로 치환해준다.
 * 그래서 process.env.EXPO_PUBLIC_API_BASE_URL 처럼 "통째로" 써야 하고,
 * const key = 'EXPO_PUBLIC_API_BASE_URL'; process.env[key] 같은 동적 접근은 undefined가 된다.
 *
 * 또 .env를 고치면 Metro 캐시 때문에 반영이 안 된다. `npx expo start -c` 로 재시작할 것.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export const ACCESS_TOKEN_KEY = "walwang.accessToken";
export const REFRESH_TOKEN_KEY = "walwang.refreshToken";

// axios는 default export에 create를 노출하는데, import/no-named-as-default-member가
// 이를 오탐으로 잡는다. axios.create는 정식 사용법이라 이 줄만 규칙을 끈다.
// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/**
 * 요청마다 SecureStore에서 토큰을 읽어 Authorization 헤더에 넣는다.
 *
 * [함정] SecureStore는 웹의 localStorage와 달리 전부 비동기(Promise)다.
 * 그래서 인터셉터를 async로 선언한다 — axios는 Promise를 반환하는 인터셉터를 지원한다.
 * 동기로 읽으려 하면 값이 항상 undefined가 되어 401만 계속 받게 된다.
 *
 * SecureStore는 네이티브 전용이라 웹에서는 동작하지 않는다.
 * 웹 지원이 필요해지면 Platform.OS로 분기해 localStorage를 쓸 것.
 */
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * refreshToken으로 access를 재발급한다(POST /user/reissue).
 * 인터셉터 재귀를 피하려고 raw axios를 쓴다. 새 access=응답 헤더, 새 refresh=바디(14일 슬라이딩).
 */
async function reissueTokens() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("refreshToken 없음");
  }
  const res = await axios.post(
    `${API_BASE_URL}/user/reissue`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  const auth = res.headers.authorization ?? res.headers.Authorization;
  const access =
    typeof auth === "string" ? auth.replace(/^Bearer\s+/i, "") : null;
  const newRefresh = (res.data as { refreshToken?: string })?.refreshToken;

  // 서버가 refresh를 회전하므로 access·refresh 둘 다 온 경우만 성공 처리(옛 토큰 유지 방지).
  if (!access || !newRefresh) {
    throw new Error("재발급 응답에 토큰이 없음");
  }

  await setAccessToken(access);
  await setRefreshToken(newRefresh);
}

// 동시 401이 여러 번 재발급을 부르지 않도록 진행 중 Promise를 공유(single-flight).
let refreshPromise: Promise<void> | null = null;

/**
 * 응답 인터셉터: 401이면 refreshToken으로 1회 재발급 후 원 요청을 재시도한다.
 * 재발급 실패 시 토큰을 정리하고 에러를 던진다(화면에서 로그인으로 유도).
 * 그 외 에러는 공통 ApiHttpError로 정규화한다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    const url = config?.url ?? "";
    const skip = url.includes("/user/reissue") || url.includes("/user/login");

    if (status === 401 && config && !config._retry && !skip) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise ?? reissueTokens();
        await refreshPromise;
        refreshPromise = null;
        return apiClient(config);
      } catch {
        refreshPromise = null;
        await clearTokens();
      }
    }

    return Promise.reject(toApiHttpError(error));
  },
);

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

/** 로그인/로그아웃/탈퇴에서 두 토큰을 함께 정리할 때 사용. */
export async function clearTokens() {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
}
