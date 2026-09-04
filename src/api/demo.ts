// 데모 공통 플래그. 모든 도메인 조회·쓰기가 이 값을 params.demo로 넘긴다(경계에서).
// 데모가 끝나면 이 한 곳만 false로 바꾸면 전체가 실서비스 공간을 본다.
// (course 저장·이름변경·삭제처럼 일부러 demo를 안 붙이는 예외는 각 함수 주석 참고)
export const DEMO_MODE = true;
