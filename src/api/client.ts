import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
