# Daejeon Lesson02 설계 및 초안 구현 기록

상태: `design-pending` / `instructor-review`. 정식 교육과정 선택·release·PDF 발행 승인이 아니다.

작업 경로: `C:\Users\deric\Desktop\AI_Lecture_Architecture\daejeon`

branch: `refactor/multi-region-ebook`

출발 HEAD: `abaf8c4f9cbfb113ddbe656ce382c4d733a2b576`

## 분석 및 구현 경계

사용자 제2차시 지시와 첨부 PNG를 기준으로 구현했다. 기존 광주 승인 Lesson04의 현재 화면 구성·원본 데이터·자동정리 코드와 관련 Lesson02/03/05의 실제 흐름을 읽었다. 과거 MDX의 사용하지 않는 ZIP 안내를 현재 기능으로 간주하지 않았다.

광주 Lesson02의 Prompt 원칙과 Lesson03의 RFP 분석·검증·Brief 흐름은 이미 대전 Day01에 연결되어 있다. 이번에는 새로운 가상 의뢰인 ‘소형 사무실 상담코너’로 작업 목적·입력자료 역할·유지·변경·금지·검토를 짧게 복습한다. DJ-CF-01/02의 같은 과제를 반복하지 않는다.

광주 Lesson04에서 재사용한 것은 요구조건 분석 → 계획 → 사람 확인 → 구현 → 테스트라는 교육 흐름이다. 광주의 실제 도구는 Electron 기반 프로젝트 관리 도구로, 대전의 수집함 기반 Node 로컬 자동정리 사양과 다르다. 광주 도구나 프로그램 코드를 복사하지 않았다. 광주 Lesson05 및 대주제3의 무드보드·콘셉트·도면 관련 실습을 앞당겨 구현하지 않았다.

확인한 주요 광주 소스:

- `src/lib/lesson04-final-content.ts`의 `organizer` 데이터
- `src/components/content/Lesson04ProjectWorkflow.astro`의 실제 자동화 수업 화면
- `src/assets/lessons/04/workspace/antigravity-manager-build-prompt.txt`
- `tools/ai-architecture-project-manager/src/organizer.cjs`, `main.cjs` 및 관련 UI
- Lesson02/03/05의 현재 MDX·전용 component·data 연결

`ReviewLayout`, `ReviewSection`, `ReviewPrompt`, `PromptCopyBlock`을 재사용했다. 새 콘텐츠는 별도 데이터·페이지·CSS로 분리했다. 공통 Layout의 새 props 기본값은 Day01과 같으며, 제2차시에서만 새 차시 표시를 사용한다. 기존 COURSE OVERVIEW와 Day01 소스, 스타일, DJ-CF-01/02 자료·생성기·PDF는 수정하지 않았다.

## 3교시 구성

| 교시 | 시간 | 구성 |
| --- | --- | --- |
| 1 | 50분 | 새 예제 복습15 → Base/Material/Lighting 역할10 → 색온도10 → 제한적 수정 실습15 |
| 2 | 50분 | Codex 역할8 → 환경과 범위12 → 계획·승인·테스트 흐름15 → 도구 요구조건15 |
| 3 | 50분 | 분류 규칙10 → 계획만 요청8 → 사람이 검토·승인하고 구현15 → 테스트12 → 결과 검토5 |

수업150분 + 교시 사이 휴식10분 두 번 = 170분이다. 요청의 ‘총3시간’과 차이나는 10분 운영은 별도 확인 사항이다. 새로운 강의 내용을 임의로 추가해 시간을 채우지 않았다. 대전의 7개 대주제 이름과 순서는 변경하지 않았다.

## 이미지 원본과 연결

Downloads 원본의 파일명과 실제 내용이 일치하지 않아 **검수용 복사본**의 파일명만 실제 내용에 맞췄다. 원본은 모두 유지했고 byte-identical 복사만 수행했다. 리사이즈·편집·새 이미지 생성은 하지 않았다.

| 실제 용도 | Downloads 원본 | review/daejeon/DJ-L02 복사본 | 원본 크기 |
| --- | --- | --- | --- |
| 색온도 | `DJ-L02_01_lighting-temperature-guide.png.png` | `DJ-L02_01_lighting-temperature-guide.png` | 1536×1024 |
| 동작 흐름 | `DJ-L02_02_auto-sort-flow.png` | `DJ-L02_02_auto-sort-flow.png` | 1672×941 |
| 분류·예외 | `DJ-L02_01_lighting-temperature-guide.png` | `DJ-L02_03_auto-sort-rules-guide.png` | 1672×941 |

각 이미지에 전체 본문 폭 표시, 확대 dialog, 원본 크기 보기, Esc 닫기와 포커스 복귀, 원본 PNG 다운로드, 용도 caption을 제공한다. PNG 제공은 로컬 review build에 한정한다. 기본 student/instructor/pdf-review build와 `dist/site`에는 실습 PNG/PDF 패키지가 들어가지 않는다.

색온도 자료는 설명용이며 생성 Reference로 사용하지 않는다. 이미지의 공간 추천은 설계·법적 표준으로 단정하지 않는다. 실제 시각적 인상은 등기구·조도·연색성·자연광·마감재·노출·디스플레이 영향을 함께 확인한다.

분류 규칙 infographic의 확장자는 대표 예시다. 실제 사양은 사용자 텍스트의 전체 목록이다. 특히 `.xyz`는 초기 분류확인, `.pdf`는 keyword 확인을 적용한다. 원본 infographic을 고치지 않고 바로 아래에 차이를 설명했다.

SHA-256:

```text
lighting b534c45faf73d084835b0a48dc588075bbea62f3c26fe82a147a243fc66e6714
flow     d8e465419e414bf4f59c568a006937bafbd3de440da9e570269b77043a3dc4c6
rules    cca8cef1d452b11ea2885d29f50d8ba26ab95a3c1c8f2194bec880ee79be837d
```

출처 매핑·파일 크기·치수·SHA는 `review/daejeon/DJ-L02/DJ-L02_asset-manifest.json`에 보존했다. 제작자·생성 도구·제작 시점·이용허락 범위는 확인되지 않았으므로 이를 추정해 표기하지 않았다.

## 자동정리 프로그램 수업 사양

이번 결과물은 e-book 초안과 교육용 요구조건·계획 Prompt·구현 승인 Prompt·테스트 시나리오다. 실행 프로그램이나 Portable 배포본을 이미 제작·검증했다고 보고하지 않는다.

수강생은 작은 `AI_파일자동정리` 폴더를 연결하고 계획만 요청한다. 6개 항목을 사람이 확인한 뒤 범위를 적어 구현을 승인하고, 제공받은 실제 테스트 자료로 검증한다. 프로그램의 별도 구현·배포는 이번 저장소 변경에 포함하지 않았다.

- Node 최신 LTS는 이번 로컬 프로그램의 실행·테스트용 runtime이다. Codex Desktop 사용 자체를 위한 설치로 설명하지 않는다.
- 버전 patch를 고정하지 않고 수업 직전 공식 다운로드에서 최신 LTS를 확인한다.
- 기본 `fs/path/crypto/http`, 외부 npm package 없이 구성하는 사양을 우선한다.
- 수집함에 의도적으로 넣은 파일만 감시한다. 복사 완료 뒤 원본보관에 byte-identical 복사하고 작업 파일을 분류한다.
- 직접 분류 확장자 9개 유형, 애매한 확장자11개, keyword4개 유형, 수동 선택12개 유형, 테스트11개와 예외11개를 명시한다.
- 이름만 같은 다른 파일은 version으로 저장한다. 동일 SHA 재투입은 추가 저장하지 않으며 수집함 잔여 파일 처리 방식은 계획에서 사람이 결정한다.
- keyword 충돌·근거 없는 파일은 `99_분류확인`으로 보낸다. `image001.png`, `scan003.pdf`를 임의 분류하지 않는 것이 핵심 성공 기준이다.
- `.tmp/.part/.crdownload/~$` 임시파일을 제외한다. 크기와 수정시간의 연속 안정, 오류·재시작·종료·포트 충돌·원본 보존을 확인한다.
- 모든 프로그램 상태·로그·설정은 자체 폴더에 둔다. Registry/Service/시작프로그램/Scheduled Task/AppData/외부 DB/cloud/telemetry/프로젝트 밖 검색은 금지한다.
- 경로 탈출·외부 symlink/junction·연결된 CAD/BIM/3D 파일의 링크 손상·원본보관 저장 실패를 계획에서 확인한다. 실습에서는 실제 작업본이 아닌 독립 테스트 복사본을 사용한다.
- STOP은 이 프로그램의 watcher/timer/server/process만 종료해야 한다. 운영체제·브라우저 자체 기록의 완전 삭제를 보장하지 않는다.

## 아직 없는 자료와 운영 결정

1. 신규 DJ-ML-01 Base, Material Reference, Lighting Reference의 승인 및 연결.
2. 11개 시나리오와 중복·오류·복사 중 파일 등을 위한 실제 테스트 asset.
3. 수업용 실행 개발본의 별도 구현·검증과 선택적 Node runtime 동봉 배포 방식.
4. 남는10분의 운영, 환경 준비 시간과 계정 접근 경로의 수업 직전 확인.

없는 자료는 ‘삽입 예정/제공 예정’으로 표시했다. 기존 카페·외관 이미지를 복제하거나 다른 공간을 신규 기준 이미지라고 제시하지 않았다.

## 변경 파일

기존7개:

- `data/courses/daejeon-2026/course.json`: reviewDraft에02/150분만 추가. 정식 lessons/release/pdf/status 유지.
- `scripts/course-registry.mjs`: review 허용 범위01/300,02/150만 검증.
- `scripts/draft-output.mjs`: 허용 review 경로와 정확3PNG allowlist.
- `scripts/build-daejeon-day01-review.mjs`: 기존46개 자료에3개 PNG 추가, 총49개 격리 review 복사.
- `scripts/verify-daejeon-review.mjs`: 미승인03 차단 검사와 review route 수 반영. Day01 검증 조건 유지.
- `src/draft/layouts/ReviewLayout.astro`: 기본값을 유지하는 Lesson02 선택 props.
- `src/draft/pages/index.astro`: 제2차시 draft 카드와 링크.

신규12개:

- `src/draft/content/daejeon-lesson02.ts`
- `src/draft/pages/lessons/02.astro`
- `src/draft/styles/lesson02.css`
- `src/draft/components/Lesson02Infographic.astro`
- `scripts/daejeon-lesson02-assets.mjs`
- `scripts/build-daejeon-lesson02-review.mjs`
- `scripts/verify-daejeon-lesson02.mjs`
- 본 문서
- `review/daejeon/DJ-L02`의3PNG와 asset-manifest JSON

## 재현 명령과 검수

PowerShell, daejeon 저장소 루트:

```powershell
npm run lint
npm run typecheck
npm run validate:content
npm run validate:courses
npm run build
node scripts/run-ebook-mode.mjs build instructor --course=daejeon-2026
node scripts/run-ebook-mode.mjs build pdf-review --course=daejeon-2026
$env:PORTAL_BASE_PATH = '/ai-architecture-design-ebook'
node scripts/build-daejeon-lesson02-review.mjs
node scripts/verify-daejeon-lesson02.mjs
node scripts/verify-daejeon-review.mjs
npm run verify:multi-course
git diff --check
```

검증 결과:

- lint/typecheck: 오류0, 경고0, 기존 deprecated API hint2개. 신규 의존성 없음.
- validate:content / validate:courses: 통과. 광주 승인203개 파일 유지.
- build 및 대전 instructor/pdf-review/local-review: 통과. `pdf-review`는 HTML 검수 모드이며 실제 PDF를 새로 생성하지 않는다.
- 제2차시 브라우저 검증: 1440/390/320px, 13개 section, 목차16개 target, 50분×3교시·10분×2휴식, 기본/펼침/확대 상태 가로 overflow 없음.
- PNG3개 실제 다운로드 MIME·파일명·SHA·원본 byte 동일, 확대·원본 크기·Esc·포커스 복귀 통과.
- Prompt5개 실제 clipboard·TXT 다운로드와 표시 원문 일치.
- 기존 COURSE OVERVIEW/Day01 렌더링 body: 동일 viewport3개에서6개 비교 모두 수정 전과 일치.
- 기존 Day01 브라우저 검증: 28section, 6교시50분, Prompt copy19/TXT download18/asset URL45, 기존 재사용 JPEG7개 모두 통과.
- multi-course 검증: 통과. 광주 승인PDF15개 SHA·metadata 유지, 접근 게이트·지역별 상태 격리·기존 링크·검색·모바일 메뉴 유지.
- git diff --check: 통과. 기존 파일7개만 수정(24줄 추가·15줄 삭제), 신규12개. 이전 untracked70개는 보존.
- 실제 자동정리 프로그램의 runtime 시험: 미수행. 이 단계의 검증은 e-book UI·요구조건·자료·보호 경계이며 실행 프로그램이나 미제공 테스트파일의 통과 주장이 아니다.

기존 파일 보호 증빙은 작업 중 생성한 `tmp/lesson02-implementation/before.json`, `day01-render-protection.json`, `protection-final.json` 및 UI 시험 기록에 보존한다. `tmp`는 Git 제외 경로다. HEAD/index는 그대로 유지하며 commit/push/merge/deploy/tag와 공식 PDF 발행을 수행하지 않는다.

현재 실행 중인 loopback 검수 서버: http://127.0.0.1:4700/ai-architecture-design-ebook/daejeon/lessons/02/

서버 재시작이 필요하면 기존 `node scripts/preview-daejeon-day01.mjs`로 격리 review 서버를 띄우고 출력된 로컬 주소의 `lessons/01/`을 `lessons/02/`로 바꾼다. 공개 배포가 아니다.

환경 설명의 공식 확인 링크: [OpenAI Quickstart](https://learn.chatgpt.com/docs/quickstart), [Desktop app](https://learn.chatgpt.com/docs/app), [Permissions](https://learn.chatgpt.com/docs/permissions), [Node.js 다운로드](https://nodejs.org/en/download). 화면·계정 제공 범위와 최신 LTS는 수업 직전에 다시 확인한다.
