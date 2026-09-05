// 런타임 코드가 아니라 "한 곳에서 켜고 끄는" 임시/점진 스위치를 모으는 파일.
// 값만 바꾸면 관련 기능이 앱 전체에서 일괄 온오프된다.

/**
 * 거절 완료(done) 화면의 **대체 장소(alternative)** 노출 여부.
 * 연동·마스킹 검증은 마쳤으나 정책 확정 전까지 임시로 숨긴다. `false`면 done.tsx가
 * "인근에 이런 곳은 어때요?" 섹션을 렌더하지 않고 조회(GET /stores/{id}/alternatives)도
 * 하지 않는다. 노출하려면 이 값을 `true`로 바꾸면 한 번에 다시 보인다.
 */
export const SHOW_REVIEW_ALTERNATIVES: boolean = false;
