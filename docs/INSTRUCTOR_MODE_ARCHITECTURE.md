# 강사용 로컬 빌드 구조

## 목적

강의 본문은 `src/content/lessons/`에 한 번만 작성합니다. 학생용과 강사용은 본문 복제본이 아니라 같은 MDX를 서로 다른 모드로 정적 빌드한 결과입니다.

```text
공통 MDX
  ├─ student build: 공통 본문
  └─ instructor build: 공통 본문 + 로컬 강사 메모
```

강사용 빌드는 로컬 전용입니다. 이번 단계에서는 온라인 로그인이나 인증을 구현하지 않습니다.

## 공개 저장소와 로컬 파일의 경계

공개 저장소에 포함하는 파일:

- `src/components/instructor/InstructorNoteSlot.astro`
- `src/lib/instructor-notes.ts`
- `instructor-content.example/lessons/01.yaml`
- 학생용·강사용 빌드 및 유출 방지 검사 스크립트

공개 저장소에 포함하지 않는 파일:

- `instructor-content/lessons/01.yaml`
- 실제 강사 멘트
- 실제 해설·정답
- 실제 백업 문구
- 개인 운영 메모

`instructor-content/` 전체는 `.gitignore`로 제외합니다. 새 환경에서는 공개 예시 템플릿을 복사한 뒤 로컬 파일에 실제 메모를 작성합니다.

공통 MDX의 슬롯은 `InstructorNoteSlot.astro`와 동일한 비활성 마커 계약을 사용합니다. 정적 빌드가 끝나면 `scripts/render-instructor-notes.mjs`가 학생용 결과물에서는 마커를 제거하고 강사용 결과물에서만 로컬 YAML을 읽어 강사 메모 HTML로 바꿉니다. 따라서 실제 메모 파일은 학생용 Astro/Vite 빌드 그래프에 들어가지 않습니다.

## 메모 스키마

```yaml
version: 1
lesson: "01"
notes:
  - slot: "l01-opening"
    type: "instructor-script"
    body: |
      로컬 전용 강사 메모
```

허용 유형:

- `instructor-script`
- `question-cue`
- `demo-warning`
- `fallback`
- `timing`
- `verification`
- `answer-key`

제1차시 슬롯:

- `l01-opening`
- `l01-generative-ai`
- `l01-ai-human-role`
- `l01-before-gemini-demo`
- `l01-after-gemini-response`
- `l01-response-analysis`
- `l01-fallback-response`
- `l01-student-practice`
- `l01-answer-key`
- `l01-closing`

## 빌드와 검증

```bash
npm run dev:student
npm run dev:instructor
npm run build:student
npm run build:instructor
```

출력 폴더:

- 학생용: `dist-student/`
- 강사용: `dist-instructor/`
- 기본 `npm run build`: 학생용 `dist/`

각 빌드 후 슬롯 변환과 `scripts/verify-instructor-boundary.mjs`가 자동 실행됩니다.

- 학생용 HTML·JavaScript에 강사 메모 슬롯, 강사용 UI, 로컬 메모 본문이 없는지 검사
- 강사용 빌드에 제1차시 메모 슬롯 10개가 있는지 검사
- 실제 강사 메모가 `.gitignore` 대상인지 검사

강사 정보를 CSS 숨김, JavaScript 토글, URL 파라미터 또는 브라우저 비밀번호로 감추지 않습니다. 강사용 결과물을 온라인에 게시하지 않습니다. 온라인 인증은 별도 보안 설계가 승인된 이후 단계입니다.

## 제1차시 자료 정책

제1차시는 Gemini 화면 캡처 없이 승인된 입력문과 2026-07-30 실제 응답 원문을 MDX 텍스트로 제공합니다. 실시간 Gemini 시연 영상은 필수가 아니며, 외부 참고 자산은 학생 페이지에 표시하지 않습니다.
