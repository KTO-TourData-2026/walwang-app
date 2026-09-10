/**
 * 데모 모드 토글·전체 안내 모달은 정책 변경으로 미사용한다(전 화면 숨김).
 * 데모 데이터 모드(§7의 isDemo 마스킹) 로직 자체는 유지되며, 여기서는 UI만 렌더하지 않는다.
 * 다시 노출이 필요하면 git 히스토리의 이전 구현(플로팅 토글 + DemoModeNoticeModal)을 복원한다.
 */
export function DemoModeFloatingToggle() {
  return null;
}
