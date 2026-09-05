import { usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoModeNoticeModal } from "@/components/demo/demo-mode-notice-modal";
import { DemoModeToggle } from "@/components/demo/demo-mode-toggle";
import { BottomTabInset, Spacing } from "@/constants/theme";

/**
 * 실사용/데모 토글을 전 화면 공통 플로팅으로 띄우는 오버레이(docs/demo-mode.md §7-2).
 * 루트 레이아웃에서 Stack 형제로 한 번만 렌더한다. 안내 모달(§6-1)도 여기서 함께 띄워
 * 어느 화면에서 ⓘ를 눌러도 열린다.
 *
 * 하단 중앙에 두되, 화면 유형별로 바닥에서 띄우는 높이를 다르게 준다. 어느 경우든
 * "떠 있는 요소 위 여백"은 탭바 간격(GAP)으로 통일한다.
 * - 메인 탭(map·saved·my): 하단 탭바 위.
 * - 하단 고정 버튼(footer)이 있는 화면(가게 상세·리뷰 플로우·코스 추천): 그 버튼 위.
 * - 그 외 스택 화면: safe-area 위.
 * 노출: 세션 이전(로그인·회원가입·스플래시)과 전체화면 모달(리뷰 결과·도장 상세)에선 숨긴다.
 */

// 탭바·safe-area 위에 두는 기본 여백.
const GAP = Spacing.three;
// 하단 고정 버튼이 있는 화면은 버튼에 타이트하게(버튼 위 12px).
const CTA_GAP = 12;
// 버튼의 윗변 높이(safe-area 제외) = footer paddingBottom(Spacing.two) + Button(minHeight).
// footer paddingTop은 버튼 위 빈 공간이라 무시한다 — 토글은 그 위가 아니라 버튼 바로 위에 붙는다.
const BUTTON_H = 52;
const CTA_BUTTON_TOP = Spacing.two + BUTTON_H;

const TAB_ROUTES = new Set(["/map", "/saved", "/my"]);
const HIDDEN_ROUTES = new Set(["/", "/login", "/signup"]);

function isHidden(pathname: string): boolean {
  if (HIDDEN_ROUTES.has(pathname)) {
    return true;
  }
  // 전체화면 위에 뜨는 투명 모달 — 오버레이가 겹치면 어색하다.
  if (pathname.startsWith("/review/") && pathname.endsWith("/result")) {
    return true; // 리뷰 결과 선택 모달
  }
  if (pathname.startsWith("/my/stamp/")) {
    return true; // 도장 상세 모달
  }
  return false;
}

// 하단 고정 버튼(footer)이 있는 화면 — 토글을 그 버튼 위로 올린다.
function hasBottomCta(pathname: string): boolean {
  if (pathname.startsWith("/store/") && !pathname.endsWith("/reviews")) {
    return true; // 가게 상세(리뷰 쓰기)
  }
  if (pathname.startsWith("/review/")) {
    return true; // 리뷰 플로우(receipt·photo·form·done) — result는 위에서 이미 숨김
  }
  if (pathname.startsWith("/recommend")) {
    return true; // 코스 추천(keywords·result)
  }
  return false;
}

export function DemoModeFloatingToggle() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (isHidden(pathname)) {
    return null;
  }

  // base = 아래에 깔린 요소(탭바/버튼/safe-area) 높이, gap = 그 위 여백.
  let base: number;
  let gap: number;
  if (TAB_ROUTES.has(pathname)) {
    base = BottomTabInset;
    gap = GAP;
  } else if (hasBottomCta(pathname)) {
    base = insets.bottom + CTA_BUTTON_TOP;
    gap = CTA_GAP;
  } else {
    base = insets.bottom;
    gap = GAP;
  }

  return (
    <View
      style={[styles.overlay, { bottom: base + gap }]}
      pointerEvents="box-none"
    >
      <DemoModeToggle />
      <DemoModeNoticeModal />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
