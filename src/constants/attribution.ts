// 마이페이지 하단 데이터 출처 표기.
//
// 공공데이터·지도/경로 SDK 약관이 요구하는 출처 표기다. 한국관광공사 항목은
// 공사의 텍스트 출처 표기 규칙("출처: ⓒ한국관광공사")을 따른다(로고·API명 단독표기 금지).

export const DATA_SOURCE_TITLE = "데이터 출처";

export const DATA_SOURCES = [
  { label: "반려동물 동반여행 정보", source: "출처: ⓒ한국관광공사" },
  { label: "상가(상권)정보", source: "소상공인시장진흥공단" },
  { label: "지도", source: "네이버클라우드" },
  { label: "보행자 경로", source: "SK텔레콤 TMAP" },
] as const;
