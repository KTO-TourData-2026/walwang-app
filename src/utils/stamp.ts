// 도장 이미지 URL 판별. 백엔드는 커스텀 도장이 없을 때 기본 발도장 애셋(default-paw)을
// stampUrl로 내려준다. 이 경우는 "커스텀 도장 없음"으로 보고 화면에서 이미지를 렌더하는 대신
// 기본 아이콘(강아지 얼굴)으로 통일한다(done·여권 도장 공통).

export const DEFAULT_STAMP_PATH = "/static/stamp/default-paw.png";

/** 커스텀 도장 이미지가 있으면 true. null·빈 문자열·기본 발도장 애셋이면 false. */
export function hasCustomStamp(url: string | null | undefined): url is string {
  return url != null && url.length > 0 && !url.endsWith(DEFAULT_STAMP_PATH);
}
