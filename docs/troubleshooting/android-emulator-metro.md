# 트러블슈팅 — Android 에뮬레이터 / Metro 실행

> 에뮬레이터 검은 화면 / 앱 즉시 종료 / `Unable to load script` — 이런 증상 뜰 때 참고.

`feat/main-map`·`feat/store-review` 두 브랜치에서 **똑같은 증상·원인**으로 반복해서 막혔다. 매번 코드를 의심했지만 실제 원인은 거의 다 **에뮬레이터·Metro 환경**이었다.

처음엔 막힐 때마다 아래 [복구 레시피](#복구-레시피-golden-path)로 그때그때 수동으로 뚫었다. 하지만 같은 문제가 두 번이나 반복돼서, "매번 고치기"를 멈추고 **근본 원인을 찾아 재발 자체를 막았다**. 그 증상·원인·복구법과 최종 영구 조치를 정리해둔다.

## 증상

- 에뮬레이터 **검은 화면** / 앱 실행 **즉시 종료** / **`Unable to load script`**
- 오래 막히지만 **브랜치 코드는 멀쩡**하다. → 코드부터 의심하지 말 것.

## 원인별 정리 & 당시 해결

막혔던 원인은 하나가 아니라 아래 여러 개가 **겹친** 경우가 많았다. 위에서부터 대략 **의심 순서**로 정렬했고, 각 행의 "해결"이 그때 실제로 통한 조치다.

| #   | 원인                                                                                                         | 해결                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | `gradlew clean` 실행 → CMake codegen 폴더 삭제(GLOB mismatch) → 네이티브 빌드 반파                           | ❌ `gradlew clean` 금지. ✅ `npx expo prebuild --clean`으로 `android/` 재생성                             |
| 2   | 네이티브 모듈 stale(`ExpoSecureStore ... is not a function`) — gradle 캐시가 옛 네이티브 재사용, JS와 불일치 | ✅ `expo prebuild --clean` + `npm run android` 클린 리빌드                                                |
| 3   | 포트 **8081**을 좀비 node/Metro가 점유 → 앱이 죽은 Metro에 붙음                                              | ✅ 8081 점유 프로세스 kill 후 Metro 재기동                                                                |
| 4   | 에뮬↔Metro 연결: 앱이 LAN IP(`192.168.x:8081`)로 못 붙음                                                     | ✅ `adb reverse tcp:8081 tcp:8081` + Metro 기본 호스트. ❌ `--localhost` 금지                             |
| 5   | 에뮬레이터 자체가 닫힘(device 없음)                                                                          | ✅ AVD 재부팅                                                                                             |
| 6   | Metro 캐시 stale — 네이티브 dep 설치 / **새 라우트 파일** 추가 후 미반영                                     | ✅ `expo start -c`로 캐시 비우고 재시작                                                                   |
| 7   | **노트북 과열(thermal throttling)** → GPU/CPU 스로틀 → 검은화면·에뮬 닫힘·ANR                                | ✅ 무거운 프로세스 끄고 식힌 뒤 **하드웨어 GPU**로 실행. ❌ `swiftshader`(소프트 렌더)는 CPU 갈아 열 악화 |
| 8   | GPU 백엔드 불안정 → 하드웨어 GPU 깜빡임 / 지도(GL 서피스) 렌더 실패                                          | ✅ `emulator -avd <name> -gpu angle_indirect`(Direct3D)                                                   |
| 9   | Metro를 백그라운드(non-TTY)로 띄우면 `expo start`가 stdin EOF로 즉시 종료                                    | ✅ Metro는 **대화형 터미널**에서 실행                                                                     |

### 헷갈렸던 함정

- `getValueWithKeyAsync is not a function`은 사실 **웹 전용 경고**다(웹은 secure-store 미지원, 스플래시 게이트가 catch). **에뮬 검은화면과 무관**한데 원인으로 오판해 시간을 날렸다.

### Fast Refresh로 반영 안 되는 것들 (재빌드/리로드 필요)

- **네이티브 dep 추가** → Fast Refresh 불가, 재빌드 필수
- **애셋 변경**(예: `pin.png`) → 네이티브 이미지 캐시라 리로드 필요
- **`useState` 기본값 변경**(예: `query`·`filter`) → 상태가 유지돼 리로드해야 반영
- **새 라우트 파일 추가** → Metro 파일맵 stale, `-c` 또는 아래 훅

## 근본 원인

- **watchman 미설치(Windows)** → node fs 워처가 **브랜치 전환·새 파일 같은 대량 변경을 놓침** → Metro 파일맵/라우트 stale (증상 #6의 뿌리).
- 그 외는 **환경 요인**(과열, GPU 드라이버, adb reverse 연결)이지 코드 문제가 아니다.

## 복구 레시피 (golden path)

막혔을 때 **그때그때 이 순서대로 수동 복구**했다. (아래 [영구 예방책](#영구-예방책-해결-완료)이 생기기 전까지는 매번 이걸 돌렸다.)

1. (네이티브 꼬였을 때만) `npx expo prebuild --clean`
2. 8081 점유 프로세스 종료
3. 에뮬 확인 → 없으면 AVD 부팅 (증상 반복 시 하드웨어/`angle_indirect` GPU)
4. `adb reverse tcp:8081 tcp:8081`
5. `npm run android` — **Metro 기본 호스트, `--localhost` 금지**
6. 네이티브 dep 추가/모듈 이상 시 위 + `expo start -c`

> 증상이 반복되면 **과열을 의심**하고(작업관리자에서 사용량 확인) 무거운 프로세스를 끈 뒤 식혀서 하드웨어 GPU로 한 번만 시도한다.

## 영구 예방책 (해결 완료)

위 복구 레시피는 어디까지나 **터진 뒤 수습하는 응급 처치**였다. 같은 증상이 두 브랜치에서 반복되며 근본 원인(**브랜치 전환 시 Metro 캐시가 stale해지는 것**)이 분명해졌고, 그래서 "매번 손으로 캐시 비우기"를 자동화해 **재발 자체를 없애기로** 했다.

**2026-08-29, `.husky/post-checkout` 훅을 도입해 "브랜치 전환 시 Metro 캐시 stale" 문제를 영구 차단했다.**
(브랜치 `chore/metro-cache-hook` · 훅 커밋 `d6fbbac`)

- **무엇을**: 브랜치 체크아웃(`$3=1`) 시 `os.tmpdir()/metro-cache`와 `.expo`를 삭제 → 다음 `expo start`가 fresh crawl.
- **어디서만**: `uname`으로 분기해 **Windows(Git Bash/MSYS)에서만** 동작. watchman이 있는 Mac/Linux에는 불필요하므로 미동작.
- **효과**: 증상 #6의 "브랜치 전환" 트리거는 이 훅으로 **재발하지 않는다**. (실행 중 새 라우트 파일 추가는 훅 범위 밖 — 이 경우는 `expo start -c`가 확실한 해결.)
- **왜 훅으로**: 근본 해결은 watchman 설치지만 Windows 지원이 불안정해, 트리거(브랜치 전환)에서 캐시를 비우는 결정적 방식으로 대체했다.

**절대 금지 (재확인)**: `gradlew clean`, Metro `--localhost`.
