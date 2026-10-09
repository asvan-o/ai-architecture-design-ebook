# Daejeon Day 01 e-book draft

상태: `design-pending` / 강사 검토용 draft. 정식 lesson·release·PDF 발행 승인을 변경하지 않았다.

## 수업 흐름

| 교시 | 50분 운영 | 수강생 기록 |
| --- | --- | --- |
| 1 | 과정 안내 12 + AI 역할 10 + Grounding 10 + 정보 구분 8 + 안전 7 + Quiz 3 | 역할·근거·확인 상태와 업로드 질문 |
| 2 | Prompt 핵심 15 + 부족한 Prompt 10 + Template 15 + Interior/Exterior 10 | 3교시용 구조화 Prompt |
| 3 | 최종 확인 5 + 생성 15 + 비교 10 + 수정 요청 10 + 재생성/비교 10 | 첫 Prompt·이미지·검토·수정 Prompt |
| 4 | 원문 읽기 10 + 자료 역할 5 + 분석 Prompt 10 + AI 분석 15 + 정리 10 | 근거·확인 상태가 있는 10개 영역 분석 |
| 5 | 원문 대조 15 + 질문/전문가 10 + Brief Prompt 10 + Brief 15 | 검증된 조건·질문·10항목 Brief |
| 6 | Brief 확인 10 + 전략 10 + 7단 Prompt 10 + 압축 5 + 생성 12 + 비교 3 | 전략·Prompt 각 2개, 생성 여건에 따라 이미지 A/B |

교시 사이 10분 휴식 5회는 수업 300분 밖이다. 과정 안내는 제1교시 안에 포함한다.

## 광주 재사용

- KEEP: `src/lib/course-overview.ts`의 AI 초안→사람 검토, 역할 분리, 판단 기록.
- KEEP: `src/content/lessons/01.mdx` §04–07·15의 생성형 AI/LLM/Multimodal, 역할, Hallucination/Grounding/HITL, 정보 유형과 확인 상태 분리, 검증 질문.
- KEEP: `src/lib/lesson02-ebook.ts`의 규칙 7개 제목·상세 설명·사례·확인 질문, 7단 공식, 빈칸 Template, 충돌 조건 수정 예시를 직접 import한다.
- KEEP: `PromptCopyBlock.astro`, `AnnotatedPromptBlock.astro`를 수정 없이 재사용한다. 문장 분석의 복사 대상은 화면의 분석 문장을 이어 붙인 텍스트다.
- ADAPT: 광주 Lesson 03의 RFP 직접 읽기→근거 분석→원문 대조→질의→Brief 원칙을 10영역 분석·10항목 Brief로 배치한다.
- DAEJEON ADD: Interior/Exterior 선택, Nano Banana 중심 첫 생성·수정, 전략별 학습/실행 Prompt와 기존 A/B 강사 예시.

## 실습자료 경계

`review/daejeon/DJ-CF-01`, `DJ-CF-02` 원본은 수정하지 않는다. 기존 PDF·PNG·Prompt를 허용 목록대로 **생성된 로컬 검토 출력**에 복사하고 SHA-256을 대조한다. 원본 도면·이미지 재생성은 없다.

- 기본 빌드: `dist/daejeon-2026/student` 및 `dist/site/daejeon`에 실습 바이너리·practice 디렉토리가 없다.
- 별도 검토 빌드: `dist/daejeon-2026/review/practice/DJ-CF-01`, `DJ-CF-02`. `review-assets.json`에 37개 파일의 원본·해시·크기를 기록한다.
- 기존 Interior 13항목 / Exterior 9항목 상세 Brief Prompt는 접힌 강사 참고로 유지한다.
- 수강생 기본 실습에는 새 10항목 `DJ-CF-01_day01-design-brief-prompt.txt`, `DJ-CF-02_day01-design-brief-prompt.txt`를 검토 출력에서만 생성한다.
- 외부 공개 다운로드·release·PDF metadata는 변경하지 않는다.

2교시에는 편집 원본 이미지와 유지/변경/제외 범위만 제시한다. 전체 RFP·기준 도면·보조 시점·기록지는 4교시에 연결한다. 29행 Matrix·생성 로그·좌표·픽셀·SHA·미채택 이미지는 기본 화면에 올리지 않는다. 상세 Brief와 A/B 예시·실제 긴 generation Prompt는 닫힌 강사 참고에 둔다.

강사 이미지는 Codex image_gen으로 만든 **교육용 강사 예시**라고 명시한다. Nano Banana에서 제작했다고 주장하지 않는다. A/B는 정답이 아니라 같은 조건을 서로 다른 방법으로 해결하는 예시다.

## 로컬 검토와 재검증

Windows PowerShell에서 저장소 루트 기준:

```powershell
$env:BASE_PATH='/ai-architecture-design-ebook'
$env:PORTAL_BASE_PATH='/ai-architecture-design-ebook'
node scripts/build-daejeon-day01-review.mjs
node scripts/preview-daejeon-day01.mjs
```

preview는 127.0.0.1에만 바인딩한다. 주소와 PID는 `tmp/day01-implementation/preview.json`에 남긴다. 시작 중인 preview가 있으면 그 주소를 재사용한다. 이 정적 검토 preview는 Astro 개발 서버가 아니다.

검증:

```powershell
npm run lint
npm run typecheck
npm run validate:content
npm run validate:courses
npm run build
node scripts/run-ebook-mode.mjs build instructor --course=daejeon-2026
node scripts/run-ebook-mode.mjs build pdf-review --course=daejeon-2026
node scripts/verify-daejeon-review.mjs
node scripts/verify-multi-course.mjs --regression
node scripts/verify-daejeon-protection.mjs
git diff --check
```

PDF-review 모드도 정식 PDF를 발행하지 않는다. 검토용 UI 검증은 실제 클립보드·TXT 다운로드·37개 파일 SHA·이미지 decode·TOC·키보드·1440/390/320px overflow를 검사한다. Windows 클립보드 CRLF와 화면 LF는 줄바꿈만 정규화하고 문자는 정확히 대조한다. 기존 TXT 파일의 줄바꿈과 끝 개행은 원본 그대로 보존한다.

보호 검증의 기준 스냅샷은 `tmp/day01-implementation/before.json`이다. 원래 작업의 변경 여부를 확인하는 일회성 기준이며 다시 만들지 않는다. 결과는 `protection-verification.json`, UI는 `ui-verification.json`, 광주 회귀검증은 `tmp/multi-course-verification.json`에 남긴다.
