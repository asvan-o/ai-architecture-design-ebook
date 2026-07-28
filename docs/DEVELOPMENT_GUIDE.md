# 개발 가이드

## 1. 프로젝트 범위

현재 단계의 목표는 학생용 웹 전자서적의 개발환경과 UI 골격을 유지하는 것입니다. 실제 강의 본문, 전문지식, 사실 주장, 출처는 승인된 자료가 제공되기 전까지 추가하지 않습니다.

## 2. 실행 환경

- Node.js: 22.12 이상
- 패키지 관리자: npm
- 출력: Astro 정적 사이트

```bash
npm install
npm run dev
```

저장소 작업 지침에 따라 자동화 환경에서는 `astro dev --background`를 사용합니다.

## 3. 명령

| 명령 | 목적 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run lint` | Astro 정적 분석 |
| `npm run typecheck` | TypeScript 및 Astro 타입 검사 |
| `npm run build` | 정적 사이트 생성 |
| `npm run preview` | 빌드 결과 미리보기 |

## 4. 구조와 책임

- `src/pages/`: URL과 페이지 조합
- `src/layouts/`: 공통 사이드바, 모바일 메뉴, 검색, 진행률
- `src/components/`: 재사용 UI와 작은 React islands
- `src/content/`: 승인된 MDX 콘텐츠
- `src/content.config.ts`: frontmatter 검증
- `src/styles/global.css`: 디자인 토큰과 공통 스타일
- `public/`: 검토된 정적 파일
- `source/`: 과거 참고자료

UI 변경은 `src/components`, `src/layouts`, `src/pages`, `src/styles`에서 진행하고, 강의 본문 변경은 사용자의 명시적인 요청이 있을 때만 `src/content`에서 진행합니다.

## 5. React 사용 기준

Astro를 기본으로 사용하고 브라우저 상태가 필요한 아래 영역만 React로 제공합니다.

- 검색 대화상자
- 프롬프트 복사
- 완료 체크 및 메모 저장
- 이미지 확대 보기
- 전후 이미지 비교

단순 표시, 내비게이션, 페이지 구조에는 React를 사용하지 않습니다.

## 6. 브라우저 저장소

체크리스트와 메모는 `localStorage`에 저장됩니다.

```text
ai-arch-bible:<lesson-id>:checks
ai-arch-bible:<lesson-id>:note
```

서버 동기화가 아니므로 다른 기기와 공유되지 않습니다. 개인 식별정보를 저장하지 않습니다.

## 7. 검색 확장

`src/pages/search-index.json.ts`가 페이지와 차시 메타데이터를 JSON으로 제공합니다. 현재는 콘텐츠가 비어 있어 제목과 요약만 색인합니다. 승인된 본문이 추가된 다음, 빌드 시 본문 텍스트를 추출해 같은 응답 형식에 추가할 수 있습니다.

## 8. GitHub Pages

`BASE_PATH`가 저장소 이름을 포함한 하위 경로를 처리합니다.

```powershell
$env:BASE_PATH="/repository-name"
npm run build
```

GitHub Actions 배포 파일은 `.github/workflows/deploy.yml`에 있습니다. 커스텀 도메인이나 사용자 루트 사이트에서는 `BASE_PATH=/`를 사용합니다.

## 9. 변경 완료 체크

1. 실제 강의 내용이 새로 생성되지 않았는지 확인
2. 키보드만으로 메뉴, 검색, 링크, 입력을 사용할 수 있는지 확인
3. 모바일 폭에서 가로 스크롤과 겹침이 없는지 확인
4. `npm run lint`
5. `npm run typecheck`
6. `npm run build`
