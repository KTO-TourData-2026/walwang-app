# 품질 자동화 — Git Hooks · CI · CodeRabbit

코드 품질을 강제하는 자동화 파이프라인 문서입니다. **커밋 → 푸시(원격) → PR** 순서로 점점 넓게 검사합니다.

> 어떤 규칙을 강제하는지(Prettier/ESLint 설정 자체)는 [code-style.md](./code-style.md)를 참고하세요. 이 문서는 그 규칙이 **언제/어디서 실행되는지**를 다룹니다.

| 단계       | 시점      | 검사                    | 막히면              |
| ---------- | --------- | ----------------------- | ------------------- |
| pre-commit | 로컬 커밋 | 스테이지 파일 포맷·lint | 커밋 차단           |
| CI         | push / PR | 전체 포맷·lint·타입     | 체크 실패(빨간불)   |
| CodeRabbit | PR        | AI 코드 리뷰            | (차단 아님, 코멘트) |

---

## 1. pre-commit (husky + lint-staged) — 로컬

| 항목    | 값                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| 도구    | `husky` + `lint-staged`                                                                                     |
| 훅 파일 | `.husky/pre-commit` → `npx lint-staged`                                                                     |
| 대상    | **스테이지된 파일만**                                                                                       |
| 동작    | `*.{ts,tsx,js,jsx}` → `eslint --fix` + `prettier --write` / `*.{json,md,css,yml,yaml}` → `prettier --write` |

- 포맷만 어긋나면 자동 수정 후 통과, **lint 에러(미사용 변수 등)가 있으면 커밋이 차단**됩니다.
- `.husky/_/`(husky 내부)는 자동 gitignore. 커밋되는 건 `.husky/pre-commit`뿐.
- 훅은 `npm install` 시 `prepare: husky` 스크립트로 자동 설치됩니다.
- lint-staged 설정은 `package.json`의 `lint-staged` 키에 있습니다.

---

## 2. CI (GitHub Actions) — 원격

| 항목   | 값                                                 |
| ------ | -------------------------------------------------- |
| 파일   | `.github/workflows/ci.yml`                         |
| 트리거 | `main`/`develop` push, 모든 PR                     |
| 검사   | `prettier --check .` → `eslint .` → `tsc --noEmit` |

- `expo lint` 대신 **raw 도구(eslint/tsc/prettier)를 직접 호출**합니다.
  `expo lint`는 `app.config.ts`를 평가하며 `NAVER_MAP_CLIENT_ID`를 요구하는데,
  CI엔 `.env`가 없으므로 secret 없이 통과시키기 위함.
- 네이티브 빌드는 무겁고 secret이 필요해서 CI에서 돌리지 않습니다. (필요 시 EAS Build 워크플로우 별도 추가)
- 연속 푸시 시 이전 실행은 자동 취소(concurrency)해 러너를 아낍니다.

---

## 3. CodeRabbit — PR AI 리뷰

| 항목      | 값                                       |
| --------- | ---------------------------------------- |
| 설정 파일 | `.coderabbit.yaml` (레포 루트)           |
| 동작      | PR 열리면 자동으로 AI 코드 리뷰 (한국어) |
| 범위 제외 | `android/`, `ios/`, lock 파일 등         |

- ESLint/Prettier가 포맷을 담당하므로, CodeRabbit은 **로직·버그·RN 함정 위주**로 보게 설정.
- **GitHub 앱 설치가 별도로 필요합니다** (레포에 코드만 넣는다고 동작 안 함):
  <https://coderabbit.ai> 에서 GitHub 로그인 → 이 레포(조직 `KTO-TourData-2026`) authorize.
- **PR 기반이라 `main`에 직접 푸시하면 리뷰가 안 붙습니다.** [convention.md](./convention.md)의 브랜치→PR 흐름을 따르세요.

---

## 참고

- 코드 스타일 규칙(Prettier/ESLint): [code-style.md](./code-style.md)
- 브랜치/커밋/PR 규칙: [convention.md](./convention.md)
- CodeRabbit 설정 문서: <https://docs.coderabbit.ai/guides/configure-coderabbit>
