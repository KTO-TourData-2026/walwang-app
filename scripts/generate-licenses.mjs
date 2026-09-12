// 오픈소스 라이선스 고지 데이터 자동 생성기.
//
// package.json의 "dependencies"(우리가 직접 선택해 앱에 싣는 라이브러리)만 대상으로,
// node_modules에서 각 패키지의 버전·라이선스 종류·라이선스 전문을 뽑아
// src/constants/oss-licenses.generated.ts 로 출력한다.
//
// 수기 관리는 하지 않는다 — 의존성이 바뀌면 `npm run licenses:generate`로 다시 돌린다.
// devDependencies(빌드 도구)는 앱에 번들되지 않으므로 제외한다.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NODE_MODULES = join(ROOT, "node_modules");
const OUT_FILE = join(ROOT, "src", "constants", "oss-licenses.generated.ts");

// LICENSE 계열 파일명(대소문자·확장자 무관). README는 제외한다.
const LICENSE_FILE_RE = /^licen[sc]e(-|_|\.|$)/i;

/** 패키지 디렉터리에서 라이선스 전문 파일을 찾아 읽는다. 없으면 null. */
function readLicenseText(pkgDir) {
  let entries;
  try {
    entries = readdirSync(pkgDir);
  } catch {
    return null;
  }
  const file = entries.find((name) => LICENSE_FILE_RE.test(name));
  if (!file) {
    return null;
  }
  try {
    return readFileSync(join(pkgDir, file), "utf8").trim();
  } catch {
    return null;
  }
}

/** package.json의 license/licenses 필드를 사람이 읽는 문자열로 정규화한다. */
function normalizeLicense(pkg) {
  if (typeof pkg.license === "string") {
    return pkg.license;
  }
  if (pkg.license?.type) {
    return pkg.license.type;
  }
  if (Array.isArray(pkg.licenses)) {
    return pkg.licenses.map((l) => l.type ?? l).join(" OR ");
  }
  return "UNKNOWN";
}

/** package.json author에서 저작권자 이름만 뽑는다(이메일·URL 제거). 없으면 null. */
function copyrightHolder(pkg) {
  const author = pkg.author;
  if (typeof author === "string") {
    return author.replace(/\s*[<(].*$/, "").trim() || null;
  }
  return author?.name ?? null;
}

// MIT·ISC는 문구가 표준이라, LICENSE 파일이 없는 패키지(예: 모노레포 서브패키지)는
// 저작권자만 채운 표준 전문으로 대체한다. 배포 시 라이선스 전문 포함 요건을 충족시킨다.
const STANDARD_LICENSE_TEXT = {
  MIT: (holder) => `MIT License

Copyright (c) ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  ISC: (holder) => `ISC License

Copyright (c) ${holder}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`,
};

/** 라이선스 전문을 구한다. 파일이 있으면 그대로, 없으면 표준 전문으로 대체한다. */
function resolveLicenseText(pkgDir, pkg, license) {
  const fileText = readLicenseText(pkgDir);
  if (fileText) {
    return fileText;
  }
  const template = STANDARD_LICENSE_TEXT[license];
  if (!template) {
    return null;
  }
  return template(copyrightHolder(pkg) ?? `the ${pkg.name} authors`);
}

const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const deps = Object.keys(rootPkg.dependencies ?? {}).sort();

const entries = [];
for (const name of deps) {
  const pkgDir = join(NODE_MODULES, ...name.split("/"));
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  } catch {
    console.warn(`[licenses] ${name}: node_modules에서 찾지 못함 — 건너뜀`);
    continue;
  }
  const license = normalizeLicense(pkg);
  entries.push({
    name,
    version: pkg.version ?? "",
    license,
    homepage: pkg.homepage ?? pkg.repository?.url ?? null,
    licenseText: resolveLicenseText(pkgDir, pkg, license),
  });
}

const banner = `// 이 파일은 scripts/generate-licenses.mjs 가 자동 생성합니다. 직접 수정하지 마세요.
// 갱신: npm run licenses:generate
`;

const body = `export type OssLicense = {
  name: string;
  version: string;
  license: string;
  homepage: string | null;
  licenseText: string | null;
};

export const OSS_LICENSES: OssLicense[] = ${JSON.stringify(entries, null, 2)};
`;

writeFileSync(OUT_FILE, `${banner}\n${body}`);
console.info(`[licenses] ${entries.length}개 패키지 → ${OUT_FILE}`);
