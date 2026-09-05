import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { setDemoModeFlag } from "@/api/demo";
import { queryClient } from "@/api/query-client";

/**
 * 실사용/데모 모드 런타임 상태(docs/demo-mode.md §7). 앱을 재실행해도 유지되도록
 * 로컬(expo-secure-store — 토큰과 같은 저장소)에 영속한다.
 *
 * - `setDemo`는 ⓐ API 경계 플래그(api/demo.ts) 동기화 + ⓑ React Query 캐시 리셋(§4)을
 *   함께 수행한다. 실사용/데모는 완전히 분리된 데이터 공간이라 전환 시 캐시를 비우지 않으면
 *   잔상이 남는다. `clear()`는 캐시 엔트리만 지우고 이미 마운트된 화면(active observer)을
 *   재조회하지 않아 옛 데이터가 그대로 남으므로, 데이터를 비우고 떠 있는 화면까지 다시
 *   조회하는 `resetQueries()`를 쓴다.
 * - `noticeVisible`은 전체 안내 모달(§6-1)의 표시 상태다. 로그인·회원가입 최초 진입 시
 *   1회 자동 노출(`maybeAutoShowNotice`)하고, "오늘 하루 다시 보지 않기"는 로컬에 날짜만
 *   저장·비교해 억제한다(API 불필요).
 */

const MODE_KEY = "walwang.demoMode";
const NOTICE_SUPPRESS_KEY = "walwang.demoNoticeSuppressedDate";

// MODE_KEY 저장 직렬화. SecureStore.setItemAsync는 같은 키 연속 쓰기의 완료 순서를 보장하지
// 않아, 토글 연타 시 이전 쓰기가 나중에 끝나 옛 모드가 영속될 수 있다. 쓰기를 큐로 순서화해
// hydrateDemoMode가 항상 마지막으로 고른 모드를 복원하게 한다.
let modeWriteQueue: Promise<void> = Promise.resolve();
function persistMode(value: boolean) {
  modeWriteQueue = modeWriteQueue
    .catch(() => {})
    .then(() => SecureStore.setItemAsync(MODE_KEY, value ? "true" : "false"))
    .catch((error) => {
      console.warn("데모 모드 상태를 저장하지 못했습니다.", error);
    });
}

// 로컬 날짜 YYYY-MM-DD. 자동 노출 하루 억제 비교에만 쓴다(타임존 이슈 회피 위해 로컬 기준).
function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface DemoModeState {
  /** 현재 데모 모드 여부. 기본값 실사용(false, §2). */
  isDemo: boolean;
  /** 영속 상태를 읽어 동기화했는지. 게이트에서 hydrate 완료를 기다린다. */
  hydrated: boolean;
  /** 전체 안내 모달 표시 상태. */
  noticeVisible: boolean;

  /** 모드 전환 — 플래그 동기화 + 캐시 리셋(비우기+재조회) + 영속. */
  setDemo: (value: boolean) => void;
  /** 안내 모달 열기(토글 옆 ⓘ 탭 등, 언제든 재열람). */
  openNotice: () => void;
  /** 안내 모달 닫기. dontShowToday면 오늘 자동 노출을 억제한다. */
  closeNotice: (dontShowToday?: boolean) => void;
  /** 로그인·회원가입 성공 후 호출 — 오늘 억제돼 있지 않으면 안내 모달을 자동 노출. */
  maybeAutoShowNotice: () => Promise<void>;
}

export const useDemoMode = create<DemoModeState>((set, get) => ({
  isDemo: false,
  hydrated: false,
  noticeVisible: false,

  setDemo: (value) => {
    if (get().isDemo === value) {
      return;
    }
    setDemoModeFlag(value); // ⓐ API 경계 동기화 — 이후 재조회가 새 demo 값을 쓰도록 먼저.
    set({ isDemo: value });
    // ⓑ 캐시 리셋(§4) — 데이터를 비우고 마운트된 화면까지 새 모드로 다시 조회한다.
    void queryClient.resetQueries();
    persistMode(value); // 쓰기 직렬화(위 persistMode 참고)
  },

  openNotice: () => set({ noticeVisible: true }),

  closeNotice: (dontShowToday) => {
    set({ noticeVisible: false });
    if (dontShowToday) {
      void SecureStore.setItemAsync(NOTICE_SUPPRESS_KEY, today());
    }
  },

  maybeAutoShowNotice: async () => {
    let suppressed: string | null = null;
    try {
      suppressed = await SecureStore.getItemAsync(NOTICE_SUPPRESS_KEY);
    } catch (error) {
      console.warn("데모 안내 억제 날짜를 읽지 못했습니다.", error);
    }
    if (suppressed !== today()) {
      set({ noticeVisible: true });
    }
  },
}));

/**
 * 앱 시작 시 1회: 저장된 모드를 읽어 상태·API 플래그를 동기화한다.
 * API 경계는 동기 읽기(getDemoMode)라 어떤 조회보다 먼저 완료돼야 하므로,
 * 진입 게이트(src/app/index.tsx)에서 토큰 확인과 함께 await 한다.
 */
let hydratePromise: Promise<void> | null = null;

export function hydrateDemoMode(): Promise<void> {
  hydratePromise ??= (async () => {
    let stored: string | null = null;
    try {
      stored = await SecureStore.getItemAsync(MODE_KEY);
    } catch (error) {
      console.warn("데모 모드 상태를 읽지 못했습니다.", error);
    }
    const isDemo = stored === "true";
    setDemoModeFlag(isDemo);
    useDemoMode.setState({ isDemo, hydrated: true });
  })();
  return hydratePromise;
}
