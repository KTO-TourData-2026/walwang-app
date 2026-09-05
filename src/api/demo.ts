// 데모 공통 플래그(런타임). 모든 도메인 조회·쓰기가 이 값을 params.demo로 넘긴다(경계에서).
// 빌드 상수가 아니라 런타임 토글이다(docs/demo-mode.md §7-1) — 하나의 빌드에서 값만 바뀐다.
//
// API 함수는 훅이 아니라 axios 호출부라 동기적으로 현재 값을 읽어야 한다. 영속 상태는
// zustand 스토어(src/stores/demo-mode.ts)에 두되, 이 모듈 지역 변수가 API 경계의 단일
// 읽기 지점이다. 스토어의 setDemo / hydrateDemoMode가 setDemoModeFlag로 이 값을 동기화한다.
//
// 기본값은 실사용(false) — 앱스토어 배포 기본 상태(§2).
// (course 저장·이름변경·삭제처럼 일부러 demo를 안 붙이는 예외는 각 함수 주석 참고)
let demoMode = false;

export const getDemoMode = () => demoMode;

export const setDemoModeFlag = (value: boolean) => {
  demoMode = value;
};
