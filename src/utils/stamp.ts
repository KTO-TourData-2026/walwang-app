// 도장 이미지 URL 판별. 백엔드는 커스텀 도장이 없을 때 기본 발도장 애셋(default-paw)을
// stampUrl로 내려준다. 이 경우는 "커스텀 도장 없음"으로 보고 화면에서 이미지를 렌더하는 대신
// 기본 아이콘(강아지 얼굴)으로 통일한다(done·여권 도장·도장 상세 공통).

export const DEFAULT_STAMP_PATH = "/static/stamp/default-paw.png";

// 데모가 이미지 URL로 내려주는 도달 불가 목 호스트. 실제로 절대 로드되지 않으므로
// 로드를 시도(=긴 타임아웃 대기)하지 않고 곧바로 기본 아이콘으로 처리한다.
const UNREACHABLE_HOSTS = ["mock-assets.local"];

/** 실제 로드 가능한 원격 이미지 URL로 보이면 true. null·빈 문자열·도달 불가 목 호스트면 false. */
export function isLoadableImageUrl(
  url: string | null | undefined,
): url is string {
  if (url == null || url.length === 0) {
    return false;
  }
  if (UNREACHABLE_HOSTS.some((host) => url.includes(host))) {
    return false;
  }
  return true;
}

/** 커스텀 도장 이미지가 있으면 true. 기본 발도장 애셋은 추가로 제외한다. */
export function hasCustomStamp(url: string | null | undefined): url is string {
  return isLoadableImageUrl(url) && !url.endsWith(DEFAULT_STAMP_PATH);
}
