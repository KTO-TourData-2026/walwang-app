# CLAUDE.md — 왈왕(walwang) 프로젝트 가이드

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 프로젝트 컨텍스트다.

## 필독 (작업 전)

@AGENTS.md

- **Expo는 자주 바뀐다.** 코드 작성 전 반드시 SDK 57 버전 문서를 확인한다: <https://docs.expo.dev/versions/v57.0.0/>
- 코드 스타일(lint·포맷) 규칙은 [docs/code-style.md](docs/code-style.md)를, 이를 강제하는 자동화(pre-commit·CI·CodeRabbit)는 [docs/ci-workflow.md](docs/ci-workflow.md)를 따른다.
- 브랜치·커밋·PR 규칙은 [docs/convention.md](docs/convention.md)를 따른다.
- 실사용/데모 모드(전환·`demo` 파라미터·마스킹·안내 모달) 규약은 [docs/demo-mode.md](docs/demo-mode.md)를 따른다.

## 프로젝트 개요

**왈왕** — 반려견 동반 가능 장소를 **견종 크기(소·중형 / 대형)** 기준으로 지도에 표시하고, 사용자 리뷰로 신뢰도를 축적하는 앱. 4주 공모전 MVP이며 **Android 우선**, 데모에서 하나의 흐름(지도→리뷰→반영→도장)이 끊김 없이 도는 것이 최우선.

- 제품 요구사항: [docs/prd.md](docs/prd.md)
- 화면 전환·플로우: [docs/user-flow.md](docs/user-flow.md)

핵심 도메인 규칙 (자세한 건 PRD):

- 크기 축은 **소·중형 / 대형 2단계**로 통일. 상태는 `가능`/`불가`/`미확인` 3단계.
- 크기 상태는 **핀 색이 아니라 상세 시트 텍스트**로 표기. 핀은 크기와 무관하게 동일 규칙.
- **핀은 이미지 애셋으로 렌더링** (커스텀 컴포넌트 마커는 성능상 금지).
- 리뷰 진입은 가게 상세의 [리뷰 쓰기] 하나뿐. 결과 선택(들어갔어요/거절)이 플로우 맨 앞.

## 기술 스택

| 항목             | 값                                                  |
| ---------------- | --------------------------------------------------- |
| 프레임워크       | Expo SDK **57** / React Native **0.86** / React 19  |
| 라우팅           | expo-router (파일 기반, typed routes)               |
| 언어             | TypeScript (strict)                                 |
| 지도             | `@mj-studio/react-native-naver-map` (네이티브 모듈) |
| 상태/데이터      | zustand, @tanstack/react-query, axios               |
| 폼               | react-hook-form + zod                               |
| 저장소           | expo-secure-store (토큰)                            |
| New Architecture | **활성(Fabric)** — SDK 57 기본                      |
| 패키지 매니저    | **npm**                                             |

## 디렉토리 구조

```
src/
  api/          API 클라이언트 (axios 인스턴스, 인터셉터)
  app/          expo-router 라우트 (= 화면)
    (auth)/       login, signup                → S-02, S-03
    (main)/       map(지도), saved, my         → S-04, S-15, S-16  (+ _layout: 하단 탭)
    recommend/    keywords, result             → S-10, S-11
    review/[placeId]/  receipt, photo, form, done → S-06, S-07, S-08, S-09
    _layout.tsx   루트 레이아웃 (Provider + Stack, 스플래시 자동 숨김 차단)
    index.tsx     S-01 게이트 — 토큰 확인 후 /map 또는 /login으로 보냄
  components/   재사용 UI (+ ui/ 하위)
  constants/    theme 등
  hooks/        커스텀 훅
  mocks/        목 데이터 (백엔드 전까지 화면 개발용)
  types/        API 응답 타입 (백엔드와 합의한 스펙)
assets/         이미지·아이콘·폰트
docs/           prd · user-flow · convention · code-style
```

## 경로 alias (tsconfig)

| alias        | 실제 경로  |
| ------------ | ---------- |
| `@/*`        | `src/*`    |
| `@/assets/*` | `assets/*` |

예: `import { MOCK_PLACES } from "@/mocks/places"`, `import icon from "@/assets/images/home.png"`. 상대경로(`../../`)보다 alias를 우선한다.

## 네이티브 설정 규칙 (중요)

- **`app.config.ts`가 네이티브 설정의 단일 소스.** `android/`·`ios/`는 `.gitignore` 처리돼 있고 `expo prebuild`가 매번 새로 생성한다. `AndroidManifest.xml`·`build.gradle`을 직접 고치지 말 것 — plugins 배열을 통해서만 넣는다.
- **네이버 지도 client_id는 `.env`의 `NAVER_MAP_CLIENT_ID`.** `.env`는 커밋 금지(gitignore), `.env.example`을 복사해 채운다. 값이 없으면 `app.config.ts`가 빌드 단계에서 에러를 던진다.
- `EXPO_PUBLIC_` 접두어가 붙은 env만 JS 번들에 포함된다. `.env` 변경 후엔 `npx expo start -c`로 캐시를 비운다.
- 네이티브 설정·의존성을 바꾸면 JS 리로드로는 반영 안 된다 → `npx expo run:android`로 재빌드.
- 지도·카메라 등 네이티브 모듈은 **Expo Go에서 동작하지 않는다.** dev build(`expo run:android`) 필수.

## 자주 쓰는 명령

```bash
npm run android      # 네이티브 dev build + 실행 (= expo run:android)
npm start            # Metro dev 서버
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write .
```

- 커밋 시 pre-commit 훅(husky + lint-staged)이 스테이지된 파일을 자동 포맷·검사한다.
- PR을 열면 CI(lint/typecheck/format)와 CodeRabbit 리뷰가 돈다. 자세한 건 [docs/ci-workflow.md](docs/ci-workflow.md).

## 코드 관례

- 포맷은 Prettier가 강제한다(**큰따옴표**, 세미콜론, 2칸, printWidth 80). 스타일은 손으로 맞추지 말고 `npm run format`.
- import 순서는 `import/order`가 강제(builtin→external→internal, 알파벳, 그룹 간 개행).
- 목 데이터는 실제 API로 갈아탈 때 파일만 지우면 되도록 `src/mocks/`에 격리하고, `src/types/`의 타입(백엔드 합의 스펙)만 의존한다.
- `console.log`는 커밋 전 제거(`warn`/`error`/`info`만 허용).
