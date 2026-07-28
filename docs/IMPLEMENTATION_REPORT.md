# AI 건축디자인 바이블 구현 검수 보고서

- 검수일: 2026-07-28
- 검수 범위: 학생용 웹 전자서적 개발환경과 UI 골격
- 검수 원칙: 실제 강의 본문이나 전문지식을 추가하지 않고 구조, 동작, 접근성, 반응형 레이아웃만 확인
- 최종 상태: 정적 빌드와 타입 검사를 통과했으며, 확인된 UI 문제를 수정함

## 검수 결과 요약

| 검수 항목 | 결과 | 확인 내용 |
| --- | --- | --- |
| 페이지와 내비게이션 | 통과 | 홈, 6개 기본 정보 화면, 14개 강의 화면, 검색 인덱스 등 22개 경로가 모두 HTTP 200 응답 |
| 반응형 레이아웃 | 통과 | 데스크톱 1440×900, 태블릿 834×1112, 모바일 390×844에서 총 63회 화면 검사, 가로 넘침 및 뷰포트 이탈 0건 |
| UI와 콘텐츠 분리 | 통과 | 페이지와 컴포넌트는 콘텐츠 컬렉션 API로 데이터를 읽으며 개별 MDX 파일을 직접 import하지 않음 |
| 14개 강의 스키마 | 통과 | 14개 파일이 동일한 frontmatter 키와 순서를 사용하며 본문은 placeholder 주석만 포함 |
| frontmatter 타입 검증 | 통과 | `day`를 문자열로 둔 임시 오류 파일에서 `InvalidContentEntryDataError` 발생을 확인하고 파일 제거 후 재검사 통과 |
| localStorage | 통과 | 체크박스와 개인 메모의 새로고침 후 유지, 차시별 저장 키 분리, 테스트 데이터 정리를 확인 |
| 키보드 접근성 | 통과 | 본문 바로가기, 시맨틱 요소, 명확한 포커스 표시, 네이티브 dialog의 Escape 닫기와 포커스 복귀 확인 |
| 임의 강의 내용 | 통과 | 전문정보, 사실 주장, 출처를 생성하지 않았으며 모든 강의 내용은 검토 대기 placeholder 상태 |
| lint·typecheck·build | 통과 | 오류, 경고, 힌트 없이 정적 빌드 완료 |

## 실행한 검사와 결과

### 개발 서버

```powershell
npm exec astro dev status
```

결과: `http://localhost:4321`에서 백그라운드 개발 서버가 실행 중임을 확인했다.

### lint

```powershell
npm run lint
```

결과:

```text
Result (22 files):
- 0 errors
- 0 warnings
- 0 hints
```

### typecheck

```powershell
npm run typecheck
```

결과:

```text
Result (22 files):
- 0 errors
- 0 warnings
- 0 hints
```

### 정적 빌드

```powershell
npm run build
```

결과:

```text
output: "static"
mode: "static"
22 page(s) built
Complete!
```

### 전체 경로 응답 검사

```powershell
$routes = @(
  '/',
  '/curriculum/',
  '/glossary/',
  '/prompts/',
  '/troubleshooting/',
  '/updates/',
  '/guide/',
  '/search-index.json'
) + (1..14 | ForEach-Object { '/lessons/{0:D2}/' -f $_ })

$routes | ForEach-Object {
  Invoke-WebRequest -Uri ("http://localhost:4321" + $_) -UseBasicParsing
}
```

결과: 22개 경로 모두 HTTP 200, 실패 0건.

### 브라우저 반응형 검사

브라우저 자동 검수로 21개 HTML 페이지를 데스크톱, 태블릿, 모바일에서 각각 확인했다.

| 뷰포트 | 크기 | 결과 |
| --- | --- | --- |
| 데스크톱 | 1440×900 | 21개 화면 통과 |
| 태블릿 | 834×1112 | 21개 화면 통과 |
| 모바일 | 390×844 | 21개 화면 통과 |

총 63회 검사에서 가로 스크롤, 뷰포트 밖 요소, 중복 또는 누락된 `h1`, 잘못 노출된 데스크톱·모바일 내비게이션이 발견되지 않았다. 브라우저 콘솔의 오류와 경고도 0건이었다.

### localStorage 검사

1. 제1차시 완료 체크박스를 선택하고 개인 메모를 저장했다.
2. 페이지를 새로고침해 두 상태가 유지되는지 확인했다.
3. 제2차시로 이동해 제1차시 데이터가 노출되지 않는지 확인했다.
4. 검수용 데이터를 삭제하고 빈 상태로 복원했다.

결과: 체크 상태와 메모가 차시별 키로 저장되고 새로고침 후 복원되며, 차시 간 데이터가 섞이지 않았다. 저장소 접근이 차단되거나 JSON 읽기에 실패할 때 UI가 중단되지 않도록 예외 처리되어 있다.

### frontmatter 오류 주입 검사

검수용 임시 강의 파일에 `day: "invalid"`를 지정하고 `npm run typecheck`를 실행했다.

결과: 숫자를 요구하는 스키마에서 문자열이 거부되어 `InvalidContentEntryDataError`가 발생했다. 임시 파일을 제거한 뒤 `npm run typecheck`를 다시 실행해 오류 0건을 확인했다.

## 수정 전 문제와 수정 내용

| 수정 전 문제 | 수정 내용 | 관련 파일 |
| --- | --- | --- |
| 검색 패널이 일반 `div` 기반이라 Escape 처리, 포커스 가두기, 닫은 뒤 호출 버튼으로의 포커스 복귀가 일관되지 않음 | 네이티브 `<dialog>`로 변경하고 열 때 검색 입력에 포커스, 닫을 때 검색 버튼으로 포커스가 돌아가도록 수정 | `src/components/SearchPanel.tsx`, `src/styles/global.css` |
| 이미지 확대 보기가 일반 오버레이여서 키보드 모달 동작이 부족함 | 네이티브 `<dialog>`로 변경하고 닫기 버튼 포커스, Escape 닫기, 원래 이미지 버튼으로 포커스 복귀를 구현 | `src/components/ImageZoom.tsx`, `src/styles/global.css` |
| 모바일 강의 목차에서 현재 차시에 `aria-current="page"`가 표시되지 않음 | 현재 강의 링크에도 `aria-current="page"`를 적용 | `src/layouts/SiteLayout.astro` |
| 모바일 목차가 Escape나 배경 클릭으로 닫힐 때 `aria-expanded`와 포커스가 항상 복원되지 않음 | dialog의 `close` 이벤트에서 상태와 포커스를 한 경로로 복원하도록 정리 | `src/layouts/SiteLayout.astro` |
| 강의 내부 목차는 11~13번인데 본문 일부가 12~14번으로 표시되어 번호가 불일치함 | 완료 체크리스트, 확인 문제, 실습 파일을 11, 12, 13으로 통일 | `src/components/CourseTools.tsx`, `src/pages/lessons/[id].astro` |

## 구현되지 않았거나 placeholder인 기능

- 실제 14개 강의 본문과 전문지식
- 실제 일정, 수업시간, 학습 목표, 용어, 이론, 시연, 실습, 확인 문제
- 검증된 출처, 사실 검증 결과, 전문가 검토 결과
- 실제 프롬프트 본문과 분류·필터 데이터
- 실제 용어 사전 항목, 오류 해결 항목, 업데이트 및 정정 내역
- 실제 이미지, 영상, 전후 비교 이미지, 실습 다운로드 파일
- 확인 문제의 정답 판정과 채점
- 승인된 MDX 본문을 강의 섹션에 연결하는 콘텐츠 작성 단계
- 본문 전체를 대상으로 하는 고급 검색 인덱싱과 검색어 강조
- 계정 기반 진도·메모 동기화. 현재 데이터는 해당 브라우저의 `localStorage`에만 저장됨

위 항목은 이번 개발환경 및 UI 골격 구축 범위에서 의도적으로 구현하지 않았다.

## 스크린샷

| 화면 | 뷰포트 | 파일 |
| --- | --- | --- |
| 데스크톱 홈 | 1440×900 | [desktop-home.png](review-screenshots/desktop-home.png) |
| 데스크톱 강의 페이지 | 1440×900 | [desktop-lesson.png](review-screenshots/desktop-lesson.png) |
| 태블릿 강의 페이지 | 834×1112 | [tablet-lesson.png](review-screenshots/tablet-lesson.png) |
| 모바일 홈 | 390×844 | [mobile-home.png](review-screenshots/mobile-home.png) |
| 모바일 강의 페이지 | 390×844 | [mobile-lesson.png](review-screenshots/mobile-lesson.png) |
| 모바일 목차 메뉴 | 390×844 | [mobile-menu.png](review-screenshots/mobile-menu.png) |

## 다음 검수 시 확인할 항목

- 승인된 Markdown/MDX 콘텐츠가 제공된 뒤 실제 본문 렌더링과 출처 메타데이터 검수
- 실제 이미지와 영상의 대체 텍스트, 용량, 비율, 확대 보기 품질 검수
- 실제 실습 파일 다운로드 링크와 파일 무결성 검수
- GitHub Pages 저장소명이 확정된 뒤 `BASE_PATH`를 적용한 배포 URL 검수
