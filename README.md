# AI 건축디자인 바이블

2026년 8월, 총 48시간의 AI 건축디자인 강의를 위한 학생용 웹 전자서적입니다. 현재 저장소는 실제 강의 본문을 포함하지 않으며, 승인된 MDX를 안전하게 삽입하기 위한 개발환경·UI 골격·콘텐츠 검증 구조만 제공합니다.

## 프로젝트 운영 기준

Codex를 포함한 모든 작업자는 작업 시작 전 [프로젝트 운영 기준](docs/PROJECT_OPERATIONS.md)을 먼저 읽어야 합니다. 공식 최신본은 특정 PC의 폴더가 아니라 GitHub 저장소의 `origin/main`입니다.

## 기술 스택

- Astro 7 정적 사이트
- TypeScript strict mode
- MDX 및 Astro Content Collections
- 작은 상호작용 영역에만 React 19 사용
- 기본 CSS

## 시작하기

Node.js 22.12 이상이 필요합니다.

```bash
npm ci
npm run dev
```

기본 개발 주소는 `http://localhost:4321/`입니다.

## 검사와 빌드

```bash
npm run lint
npm run typecheck
npm run validate:content
npm run build
npm run build:pdf
npm run preview
```

`lint`와 `typecheck`는 요청된 명령 인터페이스를 유지하기 위해 현재 모두 `astro check`를 실행합니다. 두 명령은 기능상 동일하며 Astro·MDX·TypeScript 진단을 함께 수행합니다. `validate:content`는 14개 차시의 파일 ID, day, 누락·중복, 필수 metadata를 별도로 검사합니다.

## 로컬 강의 실행과 휴대용 키트

소스 폴더에서는 `강의_실행.cmd` 또는 `npm run lecture`를 사용합니다. 최신 학생용·강사용·PDF 빌드를 검사한 뒤 127.0.0.1 전용 강의 허브를 엽니다. 종료는 `강의_종료.cmd`, 상태 확인은 `강의키트_상태확인.cmd`를 사용합니다.

다른 Windows x64 PC에서 Node.js와 npm 설치 없이 실행할 배포본은 clean working tree에서 `강의키트_생성.cmd`로 생성합니다. 미커밋 검토본은 생성 의도를 명확히 하기 위해서만 `강의키트_생성.cmd --allow-dirty`를 사용합니다. 자세한 구조와 보안 경계는 [Windows 휴대용 강의키트 가이드](docs/LECTURE_KIT_GUIDE.md)를 확인하세요.

## 콘텐츠 렌더링

- `src/pages/lessons/[id].astro`는 Content Collection 항목을 `render()`하고 MDX의 `<Content />`를 출력합니다.
- 강의 섹션 컴포넌트는 `src/components/content/`에 있으며 MDX에서 필요한 섹션만 조합할 수 있습니다.
- 용어 사전, 프롬프트, 오류 해결, 업데이트 페이지도 각각의 MDX 컬렉션을 렌더링합니다.
- 실제 강의 본문을 수정하려면 사용자의 명시적인 요청과 승인된 문서가 필요합니다.

현재 14개 강의 파일은 검토 대기 frontmatter와 짧은 UI placeholder 조합만 포함합니다. 전문정보, 사실 주장, 실제 프롬프트, 출처는 작성하지 않았습니다.

자세한 규칙은 [콘텐츠 스키마](docs/CONTENT_SCHEMA.md)와 [개발 가이드](docs/DEVELOPMENT_GUIDE.md)를 확인하세요.

## 주요 경로

```text
src/components/content/   재사용 가능한 MDX 콘텐츠 블록
src/content/              승인된 콘텐츠가 들어갈 MDX
src/pages/                라우트와 컬렉션 렌더링
src/content.config.ts     frontmatter 타입 검증
scripts/                  전체 차시 무결성 검사
docs/                     개발·검수 문서
source/                   과거 참고자료, 현재 기준이 아님
public/                   검토된 정적 파일
```

## GitHub Pages

`astro.config.mjs`는 다음 환경변수를 지원합니다.

- `SITE_URL`: 배포 origin
- `BASE_PATH`: 프로젝트 사이트 하위 경로

일반 저장소 Pages 배포 기본값:

```text
SITE_URL=https://<owner>.github.io
BASE_PATH=/<repository-name>
```

`.github/workflows/deploy.yml`은 위 값을 자동 구성하고 lint, typecheck, 콘텐츠 무결성 검사, build가 모두 성공한 경우에만 배포합니다.

PDF가 포함된 학생용 배포 결과는 다음 명령으로 생성합니다.

```bash
npm run build:student-with-pdf
```

학생 e-book 공개와 PDF 공개는 `data/student-release.json`에서 분리해 관리합니다.
`releasedStudentLessonIds`는 웹에서 읽을 수 있는 차시, `releasedPdfLessonIds`는
최종 승인되어 다운로드할 수 있는 차시입니다. 공개 빌드는 승인된 차시별 PDF와
그 차시들만 포함한 전체 교안 PDF를 새로 생성하며, 이전 출력 폴더의 오래된 PDF는
먼저 제거합니다. 현재 PDF 공개 차시는 제1차시입니다.

`npm run build:pdf`는 공개용이 아니라 강사 내부 검수용으로 제1~14차시 PDF와
전체 교안을 `dist-pdf-review/`에 생성합니다.

이 명령은 학생용 사이트를 `dist/`에 빌드한 뒤 승인된 차시 PDF와 전체 교안 PDF를
`dist/downloads/`에 생성합니다. 일반 `npm run dev`, `npm run build`,
`npm run build:student`에서는 아직 생성되지 않은 PDF 링크를 표시하지 않습니다.
PDF 파일·route 조합은 `data/pdf-exports.json`, 학생 공개 승인은
`data/student-release.json`에서 관리합니다.

사용자·조직 루트 저장소(`<owner>.github.io`)로 전환할 때는 `BASE_PATH=/`를 사용합니다. 커스텀 도메인에서는 `SITE_URL=https://<custom-domain>`과 `BASE_PATH=/`로 바꾸고 Pages의 custom domain 설정을 함께 적용합니다.
