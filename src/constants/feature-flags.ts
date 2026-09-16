// 런타임 코드가 아니라 "한 곳에서 켜고 끄는" 임시/점진 스위치를 모으는 파일.
// 값만 바꾸면 관련 기능이 앱 전체에서 일괄 온오프된다.

/**
 * 거절 완료(done) 화면의 **대체 장소(alternative)** 노출 여부.
 * 법적 검토 완료로 재노출한다. `false`면 done.tsx가 "인근에 이런 곳은 어때요?"
 * 섹션을 렌더하지 않고 조회(GET /stores/{id}/alternatives)도 하지 않는다.
 */
export const SHOW_REVIEW_ALTERNATIVES: boolean = true;
