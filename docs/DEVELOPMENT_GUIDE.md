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
| `npm run lint` | `astro check` 실행 |
| `npm run typecheck` | `astro check` 실행 |
| `npm run validate:content` | 14개 강의 파일 무결성 검사 |
| `npm run build` | 정적 사이트 생성 |
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

`draft: true`인 차시는 개발 서버에서만 검토할 수 있습니다. 운영 `npm run build`에서는 개별 차시 라우트, 홈 미리보기, 커리큘럼, 데스크톱·모바일 목차, 검색 인덱스에 포함되지 않습니다. 공개 전환은 승인 후 해당 차시의 `draft`를 `false`로 변경합니다.

## 5. 책임 분리

- `src/content/`: 승인된 MDX와 placeholder 데이터
- `src/components/content/`: MDX에서 조합하는 표시 블록
- `src/pages/`: 라우트, 컬렉션 조회, 페이지 외곽 UI
- `src/layouts/`: 사이드바, 모바일 메뉴, 검색, 진행률
- `src/components/`: 브라우저 상태가 필요한 React islands와 공통 배지
- `src/content.config.ts`: frontmatter 타입 검증
- `scripts/validate-content.mjs`: 파일 집합과 차시 번호 검증
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

## 8. 변경 완료 체크

1. 실제 강의 내용이나 출처가 임의로 추가되지 않았는지 확인
2. MDX 변경이 실제 화면에 출력되는지 확인
3. 로컬 목차와 MDX 섹션 구성이 일치하는지 확인
4. 키보드 메뉴·대화상자·입력·포커스를 확인
5. 모바일 폭에서 가로 스크롤과 겹침을 확인
6. `npm run lint`
7. `npm run typecheck`
8. `npm run validate:content`
9. `npm run build`
