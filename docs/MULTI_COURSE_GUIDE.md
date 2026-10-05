# Multi-course 개발 안내

이 문서는 구현/운영 구조에 관한 안내다. 승인된 강의 본문은 변경하지 않는다.

## 현재 기준

- 작업 worktree: `daejeon`, branch `refactor/multi-region-ebook`.
- 광주 main: `cdc99d788b9506344872c865730cd9cf002f16ec` (이번 구현에서 수정하지 않음).
- `data/courses/<courseId>/course.json`: 과정 식별, 경로, 명시적 차시 선택, 상태, 접근 설정.
- `release.json`: 과정별 학생/PDF 공개 범위.
- `pdfs.json`: 발행 버전, 업데이트 날짜, 승인 artifact의 생성 날짜·source Git SHA·SHA-256.
- 광주 `baseline-lock.json`: 기존 승인 source/content/asset의 Git blob ID. 현재 Git 기준 commit과 작업 파일을 모두 대조한다.
- `src/content/lessons`는 광주 승인본을 그대로 유지한다. 차시 분해, shared 이동, deep merge는 구현하지 않았다.
- 대전은 `design-pending`, 차시/주제 빈 배열, 시간·일정·기관 미정, PDF 미발행이다. 광주 콘텐츠를 자동 상속하지 않는다.

## URL 및 출력

포털 `/ai-architecture-design-ebook/`, 광주 `/gwangju/`, 대전 `/daejeon/`.
기존 강의/print/프롬프트/다운로드 경로는 광주로 이동하는 정적 compatibility HTML을 제공한다.
기존 PDF 파일 URL은 byte 그대로 복사하여 유지한다. HTML 이동은 JS가 있을 때 query/hash를 보존한다.

```text
dist/
  <courseId>/student/
  <courseId>/instructor/   (presentation 포함, 로컬 전용)
  <courseId>/pdf-review/   (학생 본문 HTML 검수, PDF 재생성 없음)
  portal/student/
  site/                  (학생 과정들만 합친 공개 검토용 결과물)
```

`COURSE_ID`와 Astro mode는 별개다. 다른 출력 폴더를 CLI로 지정할 수 없다.
`npm run build`는 각 과정의 student를 빌드한 다음 포털과 합쳐 `dist/site`를 만든다.
배포 workflow의 artifact 경로도 `dist/site`만 사용한다. 이 구현 단계에서는 배포를 실행하지 않는다.

```powershell
$env:BASE_PATH='/ai-architecture-design-ebook'
$env:SITE_URL='https://asvan-o.github.io'
npm run build
npm run build:student -- --course=gwangju-2026
npm run build:instructor -- --course=gwangju-2026
npm run build:pdf -- --course=gwangju-2026
npm run build:student -- --course=daejeon-2026
```

`BASE_PATH`는 포털 경로다. 과정 경로는 profile에서 붙인다. `PORTAL_BASE_PATH`로 명시할 수도 있다.
dev 명령도 `--course=<id>`를 받으며 background mode를 사용한다.
`npm run astro -- dev status`, `npm run astro -- dev logs`, `npm run astro -- dev stop`으로 관리한다.

## PDF 및 로컬 강사 자료

광주 PDF는 기존 공개 artifact 15개를 고정된 hash로 검사해 재사용한다. 최초 빌드는 공개 다운로드가 필요하다.
검증된 캐시는 `tmp/approved-pdfs/gwangju-2026`에 저장한다. hash가 다르거나 원본이 없어지면 빌드는 실패한다.
`generatedAt`, `sourceGitSha`, filename, PDF bytes를 현재 architecture commit으로 갱신하지 않는다.
독립 과정 metadata는 `downloads/course-pdf-release.json`으로 추가한다. 기존 `pdf-manifest.json`은 호환성을 유지한다.
`generate-pdfs.mjs`는 현재 두 profile에서 재발행을 차단한다. 새 발행은 별도의 승인/구현 작업이다.

Git에서 제외된 강사 자료 기본 경로:
`instructor-content/courses/<courseId>/lessons`, `instructor-content/courses/<courseId>/assets/profile`.
강사용 광주 빌드에는 기존 제1–4차시 YAML 및 기존 강사 사진/로고가 필요하다. 학생 빌드는 자료가 없어도 동작한다.
환경 변수 `INSTRUCTOR_CONTENT_DIR`, `INSTRUCTOR_PROFILE_DIR`로 기존 입력을 명시할 수 있다.
학생/print/pdf-review에는 강사 메모·콘솔·프레젠테이션이 포함되지 않는다.

## 브라우저 상태

접근 세션, 체크리스트, 메모, 발표 위치/수정, 강사 시간 운영, BroadcastChannel에 courseId를 포함한다.
광주만 이전 키를 복사하여 읽고, 원래 키는 삭제하지 않는다. 대전은 이전 광주 상태를 읽지 않는다.
기존 광주 비밀번호 hash를 유지한다. 대전 비밀번호는 이번 단계에서 정하지 않았다.
기존 클라이언트 gate는 표시 제한이다. 정적 HTML/PDF 자체의 서버 인증은 제공하지 않는다.
모든 HTML은 noindex, robots는 전체 Disallow 정책을 유지한다.

## 검증

```powershell
npm run lint
npm run typecheck
npm run validate:content
npm run validate:courses
npm run build
npm run verify:multi-course
node scripts/verify-multi-course.mjs --regression
node scripts/verify-course-hub.mjs
```

회귀 옵션은 변경 전에 캡처한 `tmp/regression-baseline/student`와 `instructor`가 필요하다.
14차시/print, 전체 교안, 프롬프트/안내 페이지, 검색 데이터, 이미지 bytes, 17개 발표 deck를 비교한다.
비교에서 허용하는 차이는 과정 URL prefix, build 전용 속성 및 JS bundle 식별자뿐이다.
교육 콘텐츠 차이가 나오면 작업을 중단하여 보고한다.
검증 결과는 `tmp/multi-course-verification.json`에 기록한다.
