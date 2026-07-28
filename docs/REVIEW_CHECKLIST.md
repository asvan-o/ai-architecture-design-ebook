# 독립 검수 체크리스트

검수일: 2026-07-28

## 콘텐츠 렌더링

- [x] lesson MDX 본문이 Astro 7 `render()`와 `<Content />`로 출력된다.
- [x] 13개 강의 섹션이 `src/components/content/`로 분리되어 있다.
- [x] MDX가 필요한 섹션만 조합할 수 있고 스키마가 동일 섹션을 강제하지 않는다.
- [x] glossary, prompts, troubleshooting, updates MDX가 실제 페이지에 연결된다.
- [x] 페이지 코드의 반복 placeholder 배열을 MDX로 이동했다.
- [x] 01.mdx 임시 문장 테스트 후 원상 복구했다.

## metadata와 무결성

- [x] contentType, authorship, verificationStatus가 분리되어 있다.
- [x] freshness, riskLevel, professionalReviewStatus가 분리되어 있다.
- [x] sources가 구조화 객체 배열이다.
- [x] 미검토 위험도와 전문가 검토 상태는 pending이다.
- [x] date, durationMinutes, lastVerified 타입이 검증된다.
- [x] title 빈 문자열을 거부한다.
- [x] 강의 14개, ID/day 일치, 중복·누락을 검사한다.
- [x] `npm run validate:content` 실패 시 종료 코드 1을 반환하도록 작성했다.

## 상호작용과 접근성

- [x] PromptCopy가 MDX text/label props를 받는다.
- [x] ImageZoom과 ImageCompare가 실제 이미지 props와 placeholder 모드를 지원한다.
- [x] 체크 상태가 안정적인 item id로 저장된다.
- [x] lesson별 localStorage namespace가 분리되어 있다.
- [x] 체크와 메모가 새로고침 후 유지된다.
- [x] 검수용 localStorage 상태를 정리했다.
- [x] 모바일 목차가 세로 스크롤과 overscroll contain을 지원한다.
- [x] 기능 없는 필터와 초성 색인이 비활성 상태다.
- [x] 명확한 focus-visible, skip link, dialog 포커스 복원을 유지한다.

## 반응형

- [x] 데스크톱 홈 1440
- [x] 데스크톱 목차 1440
- [x] 데스크톱 강의 1440
- [x] 태블릿 강의 768
- [x] 모바일 홈 390
- [x] 모바일 강의 390
- [x] 모바일 목차 open 390
- [x] 용어 사전 1440

## 검사와 빌드

- [x] `npm run lint`: 0 errors, 0 warnings, 0 hints
- [x] `npm run typecheck`: 0 errors, 0 warnings, 0 hints
- [x] `npm run validate:content`: 성공
- [x] `npm run build`: 성공
- [x] HTML 22개와 search-index.json 1개 생성
- [x] `npm ls --depth=0`: missing/invalid 없음

## 콘텐츠·보안·패키지

- [x] 실제 강의 내용과 출처를 임의로 작성하지 않았다.
- [x] .env 파일이 없다.
- [x] 민감정보와 개인 연락처가 검수 패키지 대상에서 발견되지 않았다.
- [x] 새 UI 프레임워크를 설치하지 않았다.
- [x] 새 review-bundle에서 node_modules, .git, dist, .astro, 이전 ZIP을 제외한다.
- [x] CLAUDE.md는 bundle과 FILE_TREE에 포함하지 않는다.
