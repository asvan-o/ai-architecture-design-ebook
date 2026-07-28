# AI 건축디자인 바이블 구현 및 독립 검수 보고서

- 최신화일: 2026-07-28
- 범위: 승인된 콘텐츠 삽입 전 MDX 렌더링·메타데이터·검증 기반 수정
- 콘텐츠 원칙: 실제 강의 전문내용, 건축정보, 프롬프트, 출처를 새로 작성하지 않음

## 1. 발견된 원인

1. `src/pages/lessons/[id].astro`가 lesson frontmatter만 읽고 MDX 본문을 `render()`하지 않았다.
2. 강의의 13개 섹션이 페이지 파일에 직접 작성되어 MDX를 바꿔도 화면 본문이 바뀌지 않았다.
3. 용어 사전, 프롬프트, 오류 해결, 업데이트 페이지도 Content Collection 대신 페이지 내부 placeholder 배열을 표시했다.
4. `reviewStatus` 하나에 콘텐츠 유형, 작성 방식, 검증, 최신성, 전문가 검토 의미가 섞여 있었다.
5. `highRiskContent`와 `requiresProfessionalReview`가 기본 `false`여서 미검토 콘텐츠를 안전하거나 검토 불필요한 것으로 오해할 수 있었다.
6. 프롬프트·이미지·체크리스트 값이 React 컴포넌트 내부에 고정되어 MDX에서 전달할 수 없었다.
7. 이전 `review-bundle.zip`에는 보고서의 제외 설명과 달리 `dist/` 항목 40개가 들어 있었다. ZIP에는 없던 `CLAUDE.md`도 `FILE_TREE.txt`에 잘못 표시되었다.

## 2. 수정 범위

### 콘텐츠 렌더링

- `src/pages/lessons/[id].astro`에서 Astro 7 `render(lesson)`과 `<Content />` 사용
- `src/components/content/`에 13개 강의 섹션 블록과 공통 `LessonSection.astro` 분리
- 14개 lesson MDX가 짧은 검토 대기 조합을 실제로 렌더링
- 스키마는 모든 차시에 동일 섹션 구성을 강제하지 않음
- optional `sections` frontmatter로 MDX 구성에 맞는 로컬 목차 지원
- glossary, prompts, troubleshooting, updates 페이지도 각각의 MDX를 `render()`하여 출력
- 페이지 내부 반복 placeholder를 각 컬렉션 MDX로 이동

### 상호작용

- `PromptCopy`: `text`, optional `label`
- `ImageZoom`: optional `src`, required `alt`, optional `caption`, 이미지 없는 모드
- `ImageCompare`: 전후 src·alt, optional labels, 이미지 없는 모드
- `CourseTools`: `lessonId`와 `{ id, label }[]`; item id 기준 저장
- localStorage namespace를 `ai-arch-bible:v2:lesson:<lesson-id>`로 분리
- 손상된 저장값과 저장소 접근 실패를 안전하게 무시

### 사실성 metadata

- 콘텐츠 유형, 작성 방식, 검증, 최신성, 위험도, 전문가 검토를 별도 필드로 분리
- 모든 미결정 값은 `pending`, 검증일은 `null`
- 위험도 pending은 “검토 대기”로 표시
- 전문가 검토 배지는 실제 상태에 따라 표시
- 한 콘텐츠에 여러 상태 배지를 동시에 표시
- `sources`를 구조화된 객체 배열로 변경
- `date`: `YYYY-MM-DD` 또는 `pending`
- `durationMinutes`: 양의 정수 또는 `null`
- `lastVerified`: `YYYY-MM-DD` 또는 `null`
- 빈 `title` 금지, `draft` 지원

## 3. 새 콘텐츠 렌더링 흐름

```text
src/content/**/*.mdx
  → src/content.config.ts의 Zod 검증
  → getCollection()
  → Astro 7 render(entry)
  → <Content />
  → src/components/content/*와 필요한 React island
```

MDX 본문을 바꾸면 페이지 UI 코드를 수정하지 않아도 빌드 결과에 반영된다. 현재 lesson 파일은 `LessonPlaceholder.astro`로 전체 골격을 확인하지만, 승인된 문서는 개별 섹션 컴포넌트를 필요한 만큼만 조합할 수 있다.

## 4. frontmatter 스키마

필수 공통 상태:

- `draft`
- `contentType`
- `authorship`
- `verificationStatus`
- `freshness`
- `riskLevel`
- `professionalReviewStatus`
- `sources`
- `lastVerified`

lesson 필수값:

- `title`
- `day`
- `date`
- `durationMinutes`

구조화 출처의 최소 필드는 `id`, `title`, `publisher`, `sourceType`이며 `url`, `accessedAt`, `note`는 선택이다. 현재 sources는 모두 빈 배열이다.

## 5. validate:content

`scripts/validate-content.mjs`는 다음을 검사하고 실패 시 종료 코드 1을 반환한다.

- lesson MDX가 정확히 14개인지
- 파일 ID 01–14가 모두 존재하는지
- day 1–14가 한 번씩 존재하는지
- 파일 ID와 day가 일치하는지
- 중복 day와 누락 day가 없는지
- 필수 metadata key가 모두 존재하는지
- title, date, durationMinutes, lastVerified의 placeholder 형식이 유효한지

## 6. UI·접근성·배포 설정

- 모바일 목차에 `overflow-y: auto`, `overscroll-behavior: contain`
- 작은 강조 텍스트 색상 대비 개선
- 프롬프트 필터를 “준비 중” disabled 상태로 변경
- 용어 초성 색인을 링크가 아닌 정적 disabled 표시로 변경
- 포커스 표시, skip link, dialog 포커스 복원 유지
- `@types/react`, `@types/react-dom`을 devDependencies로 이동
- `astro.config.mjs`에 `site: process.env.SITE_URL`
- workflow에 `SITE_URL`, `BASE_PATH`
- workflow 배포 전에 lint, typecheck, validate:content, build 실행

## 7. 실제 검증

2026-07-28 최종 결과:

| 명령 | 결과 |
| --- | --- |
| `npm run lint` | 성공, 45 files, 오류 0, 경고 0, 힌트 0 |
| `npm run typecheck` | 성공, 45 files, 오류 0, 경고 0, 힌트 0 |
| `npm run validate:content` | 성공, 14개·ID/day·metadata 무결성 통과 |
| `npm run build` | 성공, HTML 22개와 `search-index.json` 1개 생성 |
| `npm ls --depth=0` | 성공, missing/invalid 없음 |

`01.mdx`에 “MDX 렌더링 연결 검증용 임시 문장”을 넣고 `/lessons/01/` HTTP 응답에서 확인한 뒤 삭제했다. 최종 파일과 화면에는 이 문장이 남아 있지 않다.

다음 collection 연결도 HTTP 200과 고유 MDX marker로 확인했다.

- lesson 01
- glossary
- prompts
- troubleshooting
- updates

브라우저에서 체크박스와 메모를 변경한 뒤 새로고침하여 유지되는 것을 확인했다. 검수용 값은 다시 해제·삭제했다.

## 8. 반응형 검수

다음 파일을 현재 구현으로 다시 캡처했다.

- `desktop-home-1440.png`
- `desktop-course-1440.png`
- `desktop-lesson-1440.png`
- `tablet-lesson-768.png`
- `mobile-home-390.png`
- `mobile-lesson-390.png`
- `mobile-navigation-390.png`
- `glossary-1440.png`

데스크톱 1440, 태블릿 768, 모바일 390에서 레이아웃과 모바일 목차 세로 스크롤을 확인했다.

## 9. 실제 강의 내용을 작성했는지

작성하지 않았다. 추가된 텍스트는 UI 구조와 기능을 확인하는 “검토 예정”, “placeholder”, “준비 중” 문구뿐이다. 실제 건축 전문정보, 강의 설명, 프롬프트, 용어 정의, 오류 해결 지식, 사실 주장, 출처는 만들지 않았다.

## 10. 남아 있는 placeholder

- 14개 실제 강의 본문과 제목·일정·수업시간
- 용어 정의, 실제 프롬프트, 오류 해결 지식, 정정 데이터
- 학습 목표, 이론, 시연, 실습, 사례, 문제, 실습 파일
- 실제 이미지·영상·전후 비교·다운로드
- 승인된 sources와 검증일·위험도·전문가 검토 결과
- 프롬프트 필터와 용어 초성 색인 기능
- 확인 문제 채점, 본문 전체 검색, 계정 동기화

## 11. 로컬 실행

```bash
npm ci
npm run dev
```

검수:

```bash
npm run lint
npm run typecheck
npm run validate:content
npm run build
```

## 12. 새 검수 패키지

새 `review-bundle.zip`은 소스, 설정, 검수 문서, 최신 스크린샷만 포함한다. `node_modules`, `.git`, `dist`, `.astro`, 환경변수, 캐시, 이전 ZIP, `CLAUDE.md`는 제외한다. 정확한 구성은 `docs/FILE_TREE.txt`를 기준으로 한다.
