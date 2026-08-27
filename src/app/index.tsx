import { useEffect, useState } from "react";

import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

import { ACCESS_TOKEN_KEY } from "@/api/client";

type AuthState = "checking" | "signedIn" | "signedOut";

export default function SplashGate() {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token: string | null = null;

      try {
        token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      } catch (error) {
        console.warn(
          "토큰을 읽지 못했습니다. 로그인 화면으로 보냅니다.",
          error,
        );
      }

      if (!cancelled) {
        setAuthState(token ? "signedIn" : "signedOut");
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

  return <Redirect href={authState === "signedIn" ? "/map" : "/login"} />;
}
