# 개발 가이드

## 1. 프로젝트 범위

현재 단계는 학생용 웹 전자서적의 콘텐츠 기반 구조와 UI 골격입니다. 실제 강의 본문, 전문지식, 사실 주장, 출처는 승인된 자료가 제공되기 전까지 추가하지 않습니다.

## 2. 실행 환경

- Node.js 22.12 이상
- npm
- Astro 정적 출력

```bash
npm ci
npm run dev
```

자동화 환경에서는 저장소 지침에 따라 `astro dev --background`를 사용합니다.

## 3. 명령

| 명령 | 목적 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run dev:student` | 학생용 개발 서버를 백그라운드로 실행 |
| `npm run dev:instructor` | 로컬 강사용 개발 서버를 백그라운드로 실행 |
| `npm run lint` | `astro check` 실행 |
| `npm run typecheck` | `astro check` 실행 |
| `npm run validate:content` | 14개 강의 파일 무결성 검사 |
| `npm run build` | 학생용 정적 사이트를 `dist/`에 생성 |
| `npm run build:student` | 학생용 정적 사이트를 `dist-student/`에 생성 |
| `npm run build:instructor` | 로컬 강사용 정적 사이트를 `dist-instructor/`에 생성 |
| `npm run build:pdf` | 강사 내부 검수용 제1~14차시 PDF를 `dist-pdf-review/`에 생성 |
| `npm run build:student-with-pdf` | Pages 배포용 학생 사이트와 승인된 PDF만 `dist/`에 생성 |
| `npm run preview` | 빌드 결과 미리보기 |

`lint`와 `typecheck`는 현재 같은 Astro 진단 명령입니다. 외부 자동화와 작업 완료 기준의 명령 이름을 유지하기 위해 둘 다 제공합니다.

## 4. 콘텐츠 렌더링 흐름

```text
src/content/**/*.mdx
        ↓ Content Collection + Zod schema
src/pages/*.astro에서 getCollection()
        ↓ Astro 7 render(entry)
<Content />
        ↓
src/components/content/* + 필요한 React island
```

강의 본문을 바꾸기 위해 `src/pages/lessons/[id].astro`를 수정할 필요가 없습니다. MDX에서 필요한 콘텐츠 컴포넌트를 조합합니다. 로컬 목차 구성이 기본 13개와 다르면 frontmatter의 optional `sections` 배열을 MDX 구조와 맞춰 지정합니다.

제1차시는 승인된 16개 상세 섹션을 사용합니다. 본문은 공통 MDX에 한 번만 작성하고, `InstructorNoteSlot`은 학생용 빌드에서 아무것도 출력하지 않습니다. 강사용 빌드만 Git에서 제외된 `instructor-content/lessons/01.yaml`을 읽습니다. 구성과 유출 방지 검사는 `docs/INSTRUCTOR_MODE_ARCHITECTURE.md`를 참조합니다.

`draft`는 콘텐츠 검토 상태를 기록하는 메타데이터이며 정적 경로 생성 여부를 바꾸지 않습니다. 학생용·강사용 빌드는 모두 제1–14차시와 같은 공통 경로를 생성하며, 모드 차이는 로컬 강사 메모 포함 여부뿐입니다. 콘텐츠 공개 승인은 배포 대상 브랜치와 검토 절차로 관리합니다.

## 5. 책임 분리

- `src/content/`: 승인된 MDX와 placeholder 데이터
- `src/components/content/`: MDX에서 조합하는 표시 블록
- `src/pages/`: 라우트, 컬렉션 조회, 페이지 외곽 UI
- `src/layouts/`: 사이드바, 모바일 메뉴, 검색, 진행률
- `src/components/`: 브라우저 상태가 필요한 React islands와 공통 배지
- `src/content.config.ts`: frontmatter 타입 검증
- `scripts/validate-content.mjs`: 파일 집합과 차시 번호 검증
- `scripts/run-ebook-mode.mjs`: 학생용·강사용 정적 빌드 모드 실행
- `scripts/render-instructor-notes.mjs`: 정적 슬롯 제거 또는 로컬 강사 메모 주입
- `scripts/verify-instructor-boundary.mjs`: 강사 메모 유출 및 슬롯 검사
- `instructor-content.example/`: 공개 가능한 빈 강사 메모 스키마 예시
- `instructor-content/`: 실제 로컬 강사 메모, Git 제외
- `source/`: 과거 참고자료. 단, `approved-curriculum.md`는 사용자가 승인한
  14차시 제목·시간·범위의 기준 문서
- `data/asset-manifest.yaml`: 차시별 제작 예정 자산, 권장 제작 도구, 공개 사용·검증 상태

MDX의 `LessonOutline`에는 `assetIds`만 작성합니다. 제목, 유형, 목적, 제작 도구, 상태, 공개 사용 여부와 대체 텍스트는 `data/asset-manifest.yaml`을 단일 기준으로 사용합니다. `reference-only` 자산은 학생용 `assetIds`에 넣지 않습니다.

## 6. React props와 브라우저 저장소

- `PromptCopy`: `text`, optional `label`
- `ImageZoom`: optional `src`, required `alt`, optional `caption`
- `ImageCompare`: before/after src·alt와 optional labels
- `CourseTools`: `lessonId`, `{ id, label }[]`

체크 상태는 문장이 아니라 안정적인 item `id`로 저장합니다.

```text
ai-arch-bible:v2:lesson:<lesson-id>:checks
ai-arch-bible:v2:lesson:<lesson-id>:note
```

값이 손상되거나 저장소가 차단되면 페이지는 초기 상태로 계속 동작합니다. 서버 동기화나 개인정보 저장은 하지 않습니다.

## 7. GitHub Pages

프로젝트 저장소:

```powershell
$env:SITE_URL="https://owner.github.io"
$env:BASE_PATH="/repository-name"
npm run build
```

사용자 루트 사이트 또는 커스텀 도메인은 `BASE_PATH=/`를 사용하고 `SITE_URL`을 실제 origin으로 지정합니다. workflow는 검사 네 단계를 모두 통과한 뒤 `dist/`를 Pages artifact로 업로드합니다.

### PDF 출력

학생 e-book과 학생 PDF의 공개 범위는 `data/student-release.json`의 서로 다른 키로
관리합니다. `releasedStudentLessonIds`는 e-book 접근 범위이고,
`releasedPdfLessonIds`는 최종 승인된 PDF 범위입니다. 공개 빌드는 두 번째 목록에
있는 차시별 PDF만 만들고, 전체 교안에도 같은 차시만 포함합니다. 승인 목록에 ID를
추가하면 차시 페이지 버튼, 개별 PDF, 전체 교안 포함 범위가 함께 갱신됩니다.

생성된 `downloads/pdf-manifest.json`에는 생성 범위, source Git SHA, 생성 시각,
각 PDF의 SHA-256이 기록됩니다. 빌드 검증은 manifest와 실제 파일의 해시가 다르거나
승인되지 않은 PDF가 출력 폴더에 남아 있으면 실패합니다.

- `src/pages/print/lessons/[id].astro`: 차시별 인쇄 전용 route
- `src/pages/print/course.astro`: 공개 승인 범위 또는 강사 검수 범위의 전체 인쇄 route
- `data/pdf-exports.json`: PDF 파일명, route, 포함 차시 설정
- `scripts/generate-pdfs.mjs`: 정적 결과를 임시 로컬 서버로 제공하고 Chromium PDF 생성
- `src/styles/print.css`: A4 분할, 표·코드 줄바꿈, 접기 영역 전체 표시 규칙

PDF 다운로드 링크는 `PUBLIC_PDF_DOWNLOADS_ENABLED=true`인 학생 공개 빌드에서만
생성됩니다. `build:student-with-pdf`가 이 값을 설정하고 승인된 실제 PDF까지
생성합니다. `build:pdf`는 링크 없는 강사 내부 검수 출력입니다. 개발 서버나 일반
빌드에는 깨진 링크가 나타나지 않습니다.

향후 주제별 PDF는 `data/pdf-exports.json`에 대상을 추가하여 구성합니다.
각 대상은 `lessonIds`로 포함 차시를 지정하고, 필요하면
`sectionIdsByLesson`으로 특정 차시의 출력 섹션을 제한할 수 있습니다.
현재 콘텐츠에는 주제 메타데이터를 적용하지 않습니다.

## 8. 변경 완료 체크

1. 실제 강의 내용이나 출처가 임의로 추가되지 않았는지 확인
2. MDX 변경이 실제 화면에 출력되는지 확인
3. 로컬 목차와 MDX 섹션 구성이 일치하는지 확인
4. 키보드 메뉴·대화상자·입력·포커스를 확인
5. 모바일 폭에서 가로 스크롤과 겹침을 확인
6. `npm run lint`
7. `npm run typecheck`
8. `npm run validate:content`
9. `npm run build:student`
10. `npm run build:instructor`
11. `npm run build:pdf`
12. 학생용 결과물과 PDF에 강사 메모가 없고 강사용 결과물에 슬롯이 표시되는지 확인
