# 트러블슈팅 — EAS 빌드가 `expo config --json exited with non-zero code: 1`로 죽음

> `eas build` 시작하자마자 config 읽다가 터지고, EAS 대시보드엔 변수가 멀쩡히 등록돼 있는데도 안 될 때 참고.

## 증상

새 터미널에서 프로덕션 빌드를 돌리면 클라우드로 올라가기도 전에 로컬에서 죽는다.

```powershell
PS C:\Users\LG\walwang-app> eas build --platform android --profile production

⚠️ Detected that your app uses Expo Go for development, ...

C:\Users\LG\walwang-app\node_modules\expo\bin\cli config --json exited with non-zero code: 1
    Error: build command failed.
```

- EAS 대시보드(또는 `eas env:list`)에 `NAVER_MAP_CLIENT_ID`·`EXPO_PUBLIC_API_BASE_URL`이
  **production 환경에 정상 등록돼 있어도** 똑같이 터진다.
- `eas env:list` 자체도 같은 에러를 뱉는다. → **EAS 서버 변수 유무 문제가 아니다.**

## 원인

`eas build`는 빌드를 클라우드에 올리기 전에 **로컬에서 `expo config --json`을 한 번 실행**해
`app.config.ts`를 평가한다. 그런데 이 로컬 평가 시점엔 **EAS 서버에 등록한 변수가
아직 `process.env`에 들어와 있지 않다.**

- **EAS CLI는 `expo` 명령과 달리 로컬 `.env`를 자동으로 읽지 않는다.**
  (`expo start`/`expo run:android`는 읽어줘서 로컬 개발 땐 이 문제가 안 보인다.)
- 그래서 [`app.config.ts:22-28`](../../app.config.ts)의 방어 코드가

  ```ts
  if (!NAVER_MAP_CLIENT_ID) {
    throw new Error("NAVER_MAP_CLIENT_ID 가 없습니다. ...");
  }
  ```

  로 `throw`하고, 이게 `config --json exited with non-zero code: 1`로 표면화된다.

> **첫 빌드는 왜 됐나:** 그 직전에 `expo`를 돌렸거나 값을 수동으로 넣어서
> **셸 세션에 env가 남아 있었기** 때문. 새 터미널을 열면 세션 env가 초기화돼 재현된다.

## 해결

빌드 전에 `.env`를 **현재 PowerShell 세션에 로드**한 뒤 빌드한다.

```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^\s*([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim()) } }
```

그다음 원래 명령 그대로:

```powershell
eas build -p android --profile production
```

- 이러면 **로컬 config 평가 시점**에 `NAVER_MAP_CLIENT_ID`가 있어서 `throw`가 안 난다.
- 실제 **클라우드 빌드는 어차피 EAS 서버 변수**를 쓰므로 로컬 주입값과 무관하게 정상 진행된다.
- 이 주입은 **현재 셸 세션에서만 유효**하다. 새 터미널을 열면 다시 로드해야 한다.

## 헷갈렸던 함정

- 에러 메시지만 보면 **EAS 서버 변수 미등록**을 의심하게 되는데, 실제로는 등록돼 있어도
  **로컬 config 평가**에서 터지는 거라 방향이 완전히 다르다. `eas env:list`까지 같은 에러가
  나면 "서버 변수 문제 아님"의 신호로 본다.
