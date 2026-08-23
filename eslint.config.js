// Expo SDK 57 flat config.
// base: eslint-config-expo (RN 글로벌 / react / react-hooks / typescript 포함)
// + eslint-plugin-prettier/recommended: prettier를 lint 규칙으로 돌리고,
//   prettier와 충돌하는 포맷 규칙(indent, no-trailing-spaces 등)을 자동으로 끔.
//   => 웹 설정에서 수동으로 껐던 "indent": "off" 같은 건 더 이상 필요 없음.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // 생성물 / 네이티브 폴더는 검사 제외
    ignores: ["dist/*", ".expo/*", "android/*", "ios/*", "expo-env.d.ts"],
  },
  {
    // 기존 웹 설정에서 가져온 커스텀 규칙 중, RN에서도 유효한 것만. (모든 파일 대상)
    // 제거한 것: jsx-a11y(웹 DOM 접근성), env.browser, react-dom import 그룹,
    //   그리고 prettier가 처리하는 포맷 규칙(no-multiple-empty-lines,
    //   no-trailing-spaces, no-multi-spaces, arrow-parens, indent).
    rules: {
      // 콘솔은 확인 뒤 지우기 (warn/error/info는 허용)
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      // 중복 import 금지
      "no-duplicate-imports": "error",
      // import 구문 뒤 한 줄 개행
      "import/newline-after-import": ["error", { count: 1 }],
      // import 순서 고정 (react-dom은 RN에서 안 써서 제외)
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroups: [
            { pattern: "react", group: "builtin", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    // @typescript-eslint 규칙은 TS 파일에만. (JS 파일엔 이 플러그인이 없어서
    // 전역에 걸면 eslint.config.js·scripts/*.js에서 "plugin not found" 에러가 남)
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // 사용하지 않는 변수 (JS용 no-unused-vars 대신 TS용 사용)
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  {
    // 유틸 스크립트는 콘솔 출력이 목적이라 no-console 제외.
    files: ["scripts/**"],
    rules: {
      "no-console": "off",
    },
  },
]);
