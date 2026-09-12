# Pretendard 폰트 파일

이 폴더에 아래 **3개 파일**을 넣어야 앱이 빌드된다. (라이선스 파일이라 저장소 정책에 따라 커밋 여부를 정할 것)

| 파일명                    | 굵기 | 쓰이는 곳                     |
| ------------------------- | ---- | ----------------------------- |
| `Pretendard-Regular.ttf`  | 400  | Label 02 · 04 · 06            |
| `Pretendard-Medium.ttf`   | 500  | Label 01 · 03 · 05            |
| `Pretendard-SemiBold.ttf` | 600  | Head 01~~03 · Subtitle 01~~05 |

## 받는 곳

<https://github.com/orioncactus/pretendard> 릴리스의 `static` 폴더.

## 규칙

- **파일명을 바꾸지 말 것.** 안드로이드는 폰트 파일명이 곧 `fontFamily` 이름이라,
  이름이 어긋나면 에러 없이 조용히 시스템 폰트로 폴백된다.
  (`app.config.ts`의 expo-font 플러그인 · `src/constants/typography.ts`의 `FontFamily`와 3중으로 맞물려 있다)
- `.otf`만 구했다면 위 3곳의 확장자를 다 같이 `.otf`로 바꾸면 된다.
- **이 3개(Regular/Medium/SemiBold)만 넣는다.** 한글 폰트는 파일당 1~2MB라
  안 쓰는 굵기를 넣으면 APK 용량만 늘어난다.
- 파일을 넣거나 바꾼 뒤엔 반드시 `npx expo run:android`로 재빌드. Metro 리로드로는 반영되지 않는다.
