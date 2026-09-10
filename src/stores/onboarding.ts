import * as SecureStore from "expo-secure-store";

/**
 * 온보딩 표시 여부(이슈 #44). 최초 앱 진입(토큰 없음) 시 1회만 보여주고,
 * "시작하기"·"건너뛰기"로 벗어나면 봤음을 로컬(expo-secure-store — 토큰과 같은
 * 저장소)에 영속해 이후엔 바로 로그인으로 보낸다.
 */
const ONBOARDING_SEEN_KEY = "walwang.onboardingSeen";

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(ONBOARDING_SEEN_KEY)) === "true";
  } catch (error) {
    // 읽기 실패는 "안 봤음"으로 취급 — 온보딩을 한 번 더 보는 편이 안전하다.
    console.warn("온보딩 표시 여부를 읽지 못했습니다.", error);
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, "true");
  } catch (error) {
    console.warn("온보딩 표시 여부를 저장하지 못했습니다.", error);
  }
}
