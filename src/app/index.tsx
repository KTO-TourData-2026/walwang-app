import { useEffect, useState } from "react";

import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

import { ACCESS_TOKEN_KEY } from "@/api/client";
import { hydrateDemoMode } from "@/stores/demo-mode";
import { hasSeenOnboarding } from "@/stores/onboarding";

type AuthState = "checking" | "signedIn" | "onboarding" | "signedOut";

export default function SplashGate() {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token: string | null = null;

      // 저장된 데모 모드를 먼저 복원한다 — API 경계(getDemoMode)는 동기 읽기라
      // 첫 조회보다 먼저 완료돼야 실사용/데모 데이터 공간이 어긋나지 않는다(§7-1).
      await hydrateDemoMode();

      try {
        token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      } catch (error) {
        console.warn(
          "토큰을 읽지 못했습니다. 로그인 화면으로 보냅니다.",
          error,
        );
      }

      if (token) {
        if (!cancelled) {
          setAuthState("signedIn");
        }
        return;
      }

      // 토큰이 없으면 최초 진입 — 온보딩을 아직 안 봤을 때만 1회 노출, 이후엔 로그인으로.
      const seenOnboarding = await hasSeenOnboarding();
      if (!cancelled) {
        setAuthState(seenOnboarding ? "signedOut" : "onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authState !== "checking") {
      SplashScreen.hideAsync();
    }
  }, [authState]);

  if (authState === "checking") {
    return null;
  }

  const href =
    authState === "signedIn"
      ? "/map"
      : authState === "onboarding"
        ? "/onboarding"
        : "/login";

  return <Redirect href={href} />;
}
