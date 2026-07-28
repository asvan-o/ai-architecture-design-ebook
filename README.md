# AI 건축디자인 바이블

2026년 8월, 총 48시간의 AI 건축디자인 강의를 위한 학생용 웹 전자서적입니다. 현재 저장소는 실제 강의 본문을 포함하지 않으며, 콘텐츠를 담기 위한 개발환경·UI 골격·콘텐츠 스키마만 제공합니다.

## 기술 스택

- Astro 7
- TypeScript strict mode
- MDX 및 Astro Content Collections
- React islands: 검색, 프롬프트 복사, 체크리스트, 개인 메모, 이미지 확대, 전후 비교
- 기본 CSS
- 정적 사이트 출력

## 시작하기

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:4321`에서 실행됩니다.

## 검사와 빌드

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

`lint`와 `typecheck`는 모두 Astro의 정적 분석을 실행합니다. 정적 결과물은 `dist/`에 생성됩니다.

## 주요 경로

```text
src/
├─ components/          # 공통 UI 및 React islands
├─ content/             # 승인된 콘텐츠가 들어갈 MDX
│  ├─ lessons/
│  ├─ glossary/
│  ├─ prompts/
│  ├─ troubleshooting/
│  └─ updates/
├─ layouts/             # 사이트 공통 레이아웃
├─ pages/               # 정적 라우트
└─ styles/              # 디자인 토큰과 전역 스타일

docs/                   # 개발·콘텐츠·디자인 문서
source/                 # 과거 참고자료, 현재 기준이 아님
public/
├─ images/
├─ videos/
└─ downloads/
```

## 콘텐츠 원칙

- 실제 강의 내용은 사용자가 승인한 Markdown/MDX 문서만 반영합니다.
- 사실, 출처, 전문정보를 추정하거나 생성하지 않습니다.
- `source/`는 과거 참고자료이며, 현재 기준은 `docs/`와 승인된 `src/content/`입니다.
- 현재 14개 강의 파일은 frontmatter와 빈 본문만 포함합니다.

자세한 작성 규칙은 [CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md)를 확인하세요.

## GitHub Pages

`astro.config.mjs`는 `BASE_PATH` 환경변수로 프로젝트 사이트의 하위 경로를 지원합니다. `.github/workflows/deploy.yml`도 준비되어 있습니다.

1. 저장소 Settings → Pages에서 Source를 `GitHub Actions`로 선택합니다.
2. `main` 브랜치에 push하면 정적 빌드와 배포가 실행됩니다.
3. 사용자/조직 루트 사이트 또는 커스텀 도메인인 경우 workflow의 `BASE_PATH`를 `/`로 조정합니다.

## 현재 placeholder

강의 제목, 일정, 시간, 본문, 용어 정의, 프롬프트, 오류 해결 지식, 실습 이미지·영상·다운로드 파일, 확인 문제는 모두 검토 대기 상태입니다.
