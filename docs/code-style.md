# 코드 스타일 · Lint · Format

Walwang 앱(Expo SDK 57 / React Native)의 ESLint · Prettier 설정 정리 문서입니다.
나중에 한 번에 확인·재현할 수 있도록 실제 이 레포에 적용된 내용을 그대로 기록합니다.

> 패키지 매니저는 **npm** 입니다. (`package-lock.json` 사용)

---

## 1. 요약

| 항목      | 값                                                              |
| --------- | --------------------------------------------------------------- |
| Lint      | ESLint 9 (flat config) + `eslint-config-expo`                   |
| Format    | Prettier 3 (`eslint-plugin-prettier`로 lint와 통합)             |
| 따옴표    | **큰따옴표** (`singleQuote: false`)                             |
| 들여쓰기  | 스페이스 2칸, `printWidth` 80, 세미콜론 O, `trailingComma: all` |
| 설정 형식 | flat config (`eslint.config.js`) — SDK 53+ 기본                 |

---

## 2. 설치된 패키지 (devDependencies)

| 패키지                   | 버전      | 역할                                    |
| ------------------------ | --------- | --------------------------------------- |
| `eslint`                 | `^9.39.5` | Lint 엔진                               |
| `eslint-config-expo`     | `~57.0.1` | Expo/RN 공식 base 규칙 (react·hooks·TS) |
| `prettier`               | `^3.9.6`  | 포매터                                  |
| `eslint-config-prettier` | `^10.1.8` | Prettier와 충돌하는 포맷 규칙 자동 off  |
| `eslint-plugin-prettier` | `^5.5.6`  | Prettier를 ESLint 규칙으로 실행         |
| `typescript`             | `~6.0.3`  | 타입체크 (`tsc --noEmit`)               |

### 재설치(재현) 명령

```bash
npx expo install eslint eslint-config-expo prettier eslint-config-prettier eslint-plugin-prettier "--" --dev
```

> Windows에서는 `--dev`를 npx가 가로채지 않도록 `"--"`를 앞에 붙입니다.
> (macOS/Linux는 `"--"` 없이 `--dev`만 붙이면 됩니다.)

---

## 3. 실행 명령

```bash
npm run lint        # ESLint 검사 (= expo lint)
npx eslint . --fix  # 자동 수정 (import 순서 등)
npx prettier --write .   # 전체 포맷
npm run typecheck   # 타입 검사 (tsc --noEmit)
```

---

## 4. 설정 파일

| 파일               | 내용                                            |
| ------------------ | ----------------------------------------------- |
| `eslint.config.js` | flat config. expo base + prettier + 커스텀 규칙 |
| `.prettierrc`      | Prettier 옵션                                   |
| `.prettierignore`  | 포맷 제외 대상 (node_modules·android·ios 등)    |

### 4-1. Prettier 설정 (`.prettierrc`)

| 옵션              | 값         | 의미                       |
| ----------------- | ---------- | -------------------------- |
| `singleQuote`     | `false`    | **큰따옴표 사용**          |
| `jsxSingleQuote`  | `false`    | JSX도 큰따옴표             |
| `semi`            | `true`     | 세미콜론 필수              |
| `tabWidth`        | `2`        | 스페이스 2칸               |
| `useTabs`         | `false`    | 탭 대신 스페이스           |
| `printWidth`      | `80`       | 한 줄 최대 80자            |
| `trailingComma`   | `"all"`    | 가능한 곳 모두 후행 콤마   |
| `arrowParens`     | `"always"` | 화살표 함수 인자 괄호 항상 |
| `bracketSpacing`  | `true`     | `{ foo }` 중괄호 안 공백   |
| `bracketSameLine` | `false`    | JSX 닫는 `>`를 다음 줄로   |
| `endOfLine`       | `"lf"`     | 줄바꿈 LF                  |

### 4-2. ESLint 설정 (`eslint.config.js`)

**Base**

- `eslint-config-expo/flat` — RN 글로벌, `react`, `react-hooks`, `@typescript-eslint` 포함
- `eslint-plugin-prettier/recommended` — Prettier를 lint로 실행 + 충돌 포맷 규칙 off

**커스텀 규칙 (전 파일)**

| 규칙                          | 설정                                        | 이유                   |
| ----------------------------- | ------------------------------------------- | ---------------------- |
| `no-console`                  | `warn` (`warn`/`error`/`info`만 허용)       | `console.log`는 지우기 |
| `no-duplicate-imports`        | `error`                                     | 중복 import 금지       |
| `import/newline-after-import` | `error`                                     | import 뒤 한 줄 개행   |
| `import/order`                | `error` (그룹 정렬 + 알파벳 + 그룹 간 개행) | import 순서 고정       |

**커스텀 규칙 (TS 파일 `**/*.ts`, `**/*.tsx` 한정)**

| 규칙                                | 설정    | 이유                                   |
| ----------------------------------- | ------- | -------------------------------------- |
| `@typescript-eslint/no-unused-vars` | `error` | 미사용 변수 금지 (JS용 대신 TS용 사용) |

> TS 전용 규칙을 전 파일에 걸면 `eslint.config.js`·`scripts/*.js` 같은 JS 파일에서
> "`@typescript-eslint` plugin not found" 에러가 나므로 `files`로 스코프를 나눕니다.

**scripts 예외**

- `scripts/**` 는 콘솔 출력이 목적이라 `no-console` off.

**검사 제외 (`ignores`)**

- `dist/*`, `.expo/*`, `android/*`, `ios/*`, `expo-env.d.ts`

---

## 5. 기존 웹 React 설정에서 바뀐 점

이 설정은 팀에서 쓰던 **웹 React + TS(.eslintrc)** 설정을 RN에 맞게 이식한 것입니다.

| 제거/변경한 것                | 이유                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| `.eslintrc` → flat config     | ESLint 9 / Expo 57 기본 형식                                |
| `jsx-a11y` 플러그인 제거      | 웹 DOM 접근성 규칙. RN은 `<View>`/`accessibilityLabel` 체계 |
| `env: { browser: true }` 제거 | RN엔 `window`/`document` 없음 (expo base가 RN 글로벌 제공)  |
| `react-dom` import 그룹 제거  | react-dom은 웹 전용                                         |
| 포맷 규칙 수동 off 제거       | `eslint-config-prettier`가 일괄 처리 (indent 등)            |
| `plugin:react/*` 중복 제거    | expo base에 이미 포함                                       |

> 유지한 것: `import/order`(react-dom 제외), `no-console`, `no-unused-vars`(TS),
> `no-duplicate-imports`, `import/newline-after-import`, 큰따옴표 취향.

---

## 6. 알려진 예외 (inline disable)

| 위치                                | 규칙                                | 이유                                    |
| ----------------------------------- | ----------------------------------- | --------------------------------------- |
| `src/hooks/use-color-scheme.web.ts` | `react-hooks/set-state-in-effect`   | 웹 하이드레이션용 1회 setState (의도됨) |
| `src/api/client.ts`                 | `import/no-named-as-default-member` | `axios.create` 정상 사용법인데 오탐     |

---

## 7. 참고

- 이 규칙을 강제하는 자동화(pre-commit·CI·CodeRabbit)는 [ci-workflow.md](./ci-workflow.md) 참고
- Expo 공식 가이드: <https://docs.expo.dev/guides/using-eslint/>
- 커밋/브랜치/PR 규칙은 [convention.md](./convention.md) 참고
