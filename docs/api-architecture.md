# API 아키텍처 가이드

백엔드 연동 공통 규약. 화면을 붙일 때 이 패턴을 따른다. 데이터는 목(`src/mocks`)에서 시작해
**목 호출 → 훅 교체 → 목 삭제** 순으로 연동한다.

## 폴더 구조

```
src/api/
  client.ts        axios 인스턴스 + 토큰 인터셉터(요청) + 에러 정규화(응답)
  endpoints.ts     도메인별 엔드포인트 상수 · path 함수
  query-client.ts  React Query 전역 QueryClient (app/_layout에서 주입)
  query-keys.ts    도메인별 쿼리 키 팩토리
  http-error.ts    공통 ApiHttpError + axios 에러 정규화
  user.ts          도메인별 단일 호출 함수(예시) — store/review/course는 이 파일을 본떠 추가
src/types/         Request/Response 타입(백엔드 합의 스펙) — api 함수가 재사용
src/hooks/         화면 단 react-query 훅(useXxxQuery / useXxxMutation)
src/mocks/         연동되면 도메인별로 삭제
```

레이어: **컴포넌트 → 훅(`src/hooks`) → 도메인 함수(`src/api/<domain>.ts`) → `apiClient`**.
컴포넌트는 `apiClient`를 직접 부르지 않는다.

## 요청/응답 흐름

1. 도메인 함수가 `apiClient` + `API_ENDPOINTS`로 호출한다.
2. 서버 원본(snake_case/enum)을 **함수 경계에서 앱 타입(camelCase)으로 매핑**해 반환한다.
3. 훅이 `queryKeys`로 캐시하고, 컴포넌트는 훅만 쓴다.

## 인증

- **access token**: 요청 인터셉터가 SecureStore에서 읽어 `Authorization: Bearer`로 자동 주입.
- **로그인**: access는 응답 **헤더**(`Authorization`), refresh는 **바디**로 온다 → `setAccessToken` / `setRefreshToken`.
- **로그아웃/탈퇴**: `clearTokens()`로 둘 다 삭제. 로그아웃은 바디에 `refreshToken` 동봉.
- **401 재발급**: `POST /user/reissue`(바디 `{ refreshToken }`)로 access 재발급 후 원 요청 1회 재시도(`client.ts` 응답 인터셉터, single-flight). 새 access=응답 헤더·새 refresh=바디(14일 슬라이딩). 재발급 실패 시 `clearTokens()` 후 에러 → 화면에서 로그인 유도.

## 에러 처리

- 모든 응답 에러는 응답 인터셉터에서 `ApiHttpError`(`status` · `message` · `data`)로 정규화된다.
- 화면/훅은 이 타입만 보고 상태코드로 분기(400/401/403/…). 서버 메시지는 `message`에 담김.

## 쿼리 키 · 캐시

- 키는 `queryKeys.<domain>....`만 사용(문자열 배열 직접 작성 금지).
- 무효화는 계층으로: `invalidateQueries({ queryKey: queryKeys.user.all })`.
- 기본 `staleTime` 60s · `retry` 1 (`query-client.ts`). 도메인별로 필요하면 훅에서 개별 조정.

## 매핑 규칙 (프론트 기준 — 서버 불일치는 경계에서 흡수)

- snake_case → camelCase (`store_name→name`, `review_count→reviewCount`, `totalDuration→totalTime`, `courseId→id`)
- enum: `LARGE/SMALL_MEDIUM → large/smallMedium`, `PARK/CAFE/… → park/cafe/…`
- 좌표: `geog { lat, lng } → { latitude, longitude }`
- 상태: 서버 5단계(`*_LIKELY` 포함) → 앱 3단계(가능/불가/미확인)로 접기
- 파일 업로드: RN `FormData`에 `{ uri, name, type }` append (웹 `File` 아님)

## 연동 순서 (도메인마다)

1. `endpoints.ts`에 경로 추가(필요 시).
2. `src/types`에 Request/Response 타입 확인·보강.
3. `src/api/<domain>.ts`에 단일 호출 함수 + 매핑 작성.
4. `queryKeys`에 키 추가 → `src/hooks`에 훅 작성.
5. 화면의 목 호출을 훅으로 교체 → 해당 `src/mocks` 파일 삭제.

## ✅ 백엔드 확인 완료 (#19)

#19에서 요청했던 항목은 swagger(`/v3/api-docs`) 기준 모두 반영됨. 프론트는 경계에서 camelCase·enum만 매핑한다.

- ✅ `GET /user/me/reviews` — `storeName`·`type` 포함, `page/size`
- ✅ `GET /user/store` — `address` 포함
- ✅ `GET /user/me` — `stampCount` 포함
- ✅ 여권 preview(`GET /user/me/passport`) — 정상 배열(`id`·`stampUrl`·`status`·`createdAt`)
- ✅ 토큰 재발급 `POST /user/reissue`
- ✅ `DELETE /course/{courseId}` (단수 경로 실재)
- ✅ 상태 등급 — 서버 3단계(`POSSIBLE`/`IMPOSSIBLE`/`UNKNOWN`) → 앱 `allowed`/`denied`/`unknown`과 1:1(이름만 매핑, 5→3 접기 불필요)
