# AI 건축디자인 바이블

2026년 8월, 총 48시간의 AI 건축디자인 강의를 위한 학생용 웹 전자서적입니다. 현재 저장소는 실제 강의 본문을 포함하지 않으며, 승인된 MDX를 안전하게 삽입하기 위한 개발환경·UI 골격·콘텐츠 검증 구조만 제공합니다.

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

이 명령은 학생용 사이트를 `dist/`에 빌드한 뒤 14개 차시 PDF와 전체 교안 PDF를
`dist/downloads/`에 생성합니다. 일반 `npm run dev`, `npm run build`,
`npm run build:student`에서는 아직 생성되지 않은 PDF 링크를 표시하지 않습니다.
PDF 생성 대상과 향후 주제별 조합은 `data/pdf-exports.json`에서 관리합니다.

사용자·조직 루트 저장소(`<owner>.github.io`)로 전환할 때는 `BASE_PATH=/`를 사용합니다. 커스텀 도메인에서는 `SITE_URL=https://<custom-domain>`과 `BASE_PATH=/`로 바꾸고 Pages의 custom domain 설정을 함께 적용합니다.
