# Windows 휴대용 강의키트

## 공식 실행 방식

공식 방식은 `.cmd` 실행 파일과 Node.js 공식 Windows x64 휴대용 ZIP 런타임의 조합이다. 별도 EXE 래퍼, 관리자 권한, 시스템 Node.js 설치, PowerShell 실행 정책 변경은 요구하지 않는다.

## 소스 모드

`강의_실행.cmd`는 package/lock/Node 버전 지문이 달라졌을 때만 `npm ci`를 실행하고, 최신 학생용·강사용·PDF 빌드를 검사한 뒤 로컬 허브를 연다.

- 실행: `강의_실행.cmd` 또는 `npm run lecture`
- 상태: `강의키트_상태확인.cmd` 또는 `npm run lecture:status`
- 종료: `강의_종료.cmd` 또는 `npm run lecture:stop`

## 휴대용 키트 생성

기본 생성은 clean working tree에서만 허용한다.

```text
강의키트_생성.cmd
```

검토 중인 미커밋 소스로 생성해야 할 때만 명시적으로 다음을 사용한다.

```text
강의키트_생성.cmd --allow-dirty
```

출력은 `release/AI_건축디자인_강의키트_windows_x64/`와 같은 이름의 ZIP이다. 생성 실패 시 기존 키트를 교체하지 않으며, 성공 교체 시 직전 버전 하나만 `.backup`으로 보존한다.

## 로컬 경계

세 서버는 모두 `127.0.0.1`에만 바인딩된다. 학생용 사이트에는 강사 콘솔, 프로젝터 제어 코드, 강사 YAML과 메모 본문이 포함되지 않는다. 정적 서버는 경로 이탈, `.git`, `.env`, `source`, YAML 및 로컬 강사 메모 경로 접근을 거부한다.

## ZIP 무결성

ZIP 자체의 실제 SHA-256은 인접한 `.zip.sha256` 파일에 기록한다. ZIP 내부 파일이 자기 자신을 포함한 ZIP 해시를 그대로 포함하는 것은 순환 참조라 불가능하므로, `BUILD_INFO.json.portableZipSha256`은 해당 외부 검사 파일명을 기록한다.
