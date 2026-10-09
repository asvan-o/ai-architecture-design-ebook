# Daejeon Day 01 approved draft

## 승인 기록

- 승인 범위: COURSE OVERVIEW 및 Day 01 1~6교시의 현재 검수된 draft 콘텐츠·UI·선택 실습자료. v2 전체 검수와 첫 화면 요약 Workflow 보완을 포함한다.
- 승인 상태 기록일: 2026-10-09, Asia/Seoul. 본 사용자 요청의 “강사·ChatGPT 검수를 통과한 승인된 draft 기준본” 선언에 근거한다. 과거 개별 검수의 정확한 승인 시각을 새로 추정하지 않는다.
- Content approval: **Day 01 approved draft**.
- Course status: **design-pending 유지**. 콘텐츠 draft 승인과 과정 release 승인은 별도다.
- 현재 코드의 `reviewDraft.status = instructor-review`, 빈 정식 `lessons`, 빈 release 목록 및 `not-issued` PDF 정책은 변경하지 않는다. 이번 문서 생성으로 공개 상태가 승격되지 않는다.
- 작업 저장소: `C:\Users\deric\Desktop\AI_Lecture_Architecture\daejeon`.
- Branch: `refactor/multi-region-ebook`.
- 감사 시 HEAD: `efc3cb012b34523b86f4fd3f1f822554ebe26f95`.
- 광주 보호 기준: `cdc99d788b9506344872c865730cd9cf002f16ec`.
- 최초 작성은 commit 전 감사 계획이다. 2026-10-09 후속 명시 승인에 따라 Commit 1·2와 별도 corrective commit을 생성했고, corrective clean checkout PASS 후 아래 Commit 3의 정확한 21개 경로를 commit한다. push·merge·deploy 및 정식 release 승인은 포함하지 않는다.

## 승인된 수업 범위

| 교시 | 주제 | 수업 시간 |
| --- | --- | ---: |
| 1 | AI와 디자이너의 판단; 과정 안내 포함 | 50분 |
| 2 | Prompt를 작업지시서로 만들기 | 50분 |
| 3 | Nano Banana 이미지 생성·수정 | 50분 |
| 4 | RFP를 AI로 분석하기 | 50분 |
| 5 | AI 분석 검증 + Design Brief | 50분 |
| 6 | Brief를 이미지 전략으로 연결 | 50분 |

수업 300분과 교시 사이 10분 휴식 5회(50분)를 구분한다. 과정 안내 12분은 제1교시 안에 포함한다. 마지막 교시 뒤의 별도 휴식을 새로 정하지 않는다. 기존 시간표를 변경하지 않는다.

2~3교시는 DJ-CF-01 Interior, DJ-CF-02 Exterior 또는 BASE 01~05 중 입력 이미지를 선택한다. 4~6교시는 DJ-CF-01 또는 DJ-CF-02 한 프로젝트를 선택해 이어간다. DJ-CF-01은 상대적으로 Guided Example, DJ-CF-02는 질문과 판단을 더 직접 도출하는 Practice Example이다.

RFP → AI 분석 → 원문·근거 검증 → Design Brief → 전략 및 Prompt → 이미지 → 비교·선택 흐름을 유지한다. 첫 생성은 정답이 아닌 디자이너가 검토하고 수정하는 첫 제안이다. 수강생이 추가 질문·질문 대상·답에 따라 달라질 결정을 도출한다.

첫 화면 요약은 다음과 같다.

실무자료 → 조건 분석 → Design Brief → 이미지 시각화 → 도면·3D → 법규 검토 → 검증 → 포트폴리오·결과보고

상세 11단계 Workflow는 별도로 유지한다. 이 방향 소개가 제2일차 이후 콘텐츠·시간표를 새로 승인하는 것은 아니다.

## 광주 재사용과 도구 역할

- 광주 Lesson 01의 AI 역할, Hallucination/Grounding/HITL, 정보 유형·확인 상태 및 전문 판단 원칙을 의미 변경 없이 재사용한다.
- 광주 Lesson 02의 좋은 Prompt 7가지 규칙·상세 사례와 7단 공식을 직접 재사용한다. 숫자가 같다는 이유로 축약하거나 하나로 대체하지 않는다.
- 플라워 카페 최초/수정 결과, 원본 요청/수정 요청, BASE 01~05는 현재 광주 원본과 SHA-256이 같은 기존 Git asset을 사용한다. 새 이미지로 대체하거나 Gwangju 원본을 수정하지 않는다.
- 기존 alt·캡션·출처·Google AI 생성 표시 및 manifest의 권리 검토 상태를 유지한다. draft 콘텐츠 승인은 별도의 공개 재사용 권리 검토를 대신하지 않는다.
- 수강생 기본 이미지 실습은 Nano Banana 첫 생성·수정이다. ChatGPT Image는 이후 정밀 수정·합성·오류 수정 역할로 안내한다. 서비스의 실제 모델·기능·계정 제공 상태를 임의 확정하지 않는다.
- 현재 강사 A/B 이미지는 Codex image_gen 교육용 예시다. Nano Banana에서 만든 결과라고 표시하지 않는다.

## 수강생 자료와 강사 자료

수강생 기본 화면에는 입력 현황 이미지, RFP·기준 도면·기록지, 분석 Prompt, 공통 10항목 Brief, 학습용 7단 Prompt와 짧은 실행 Prompt를 순서에 맞게 제공한다. 강사용 상세 Brief·A/B 예시·실제 생성 Prompt는 기본 접힘 참고 영역에 둔다. 좌표·픽셀·전체 생성 로그·미채택 이미지는 기본 수강생 작업 흐름에 넣지 않는다.

현재 다운로드는 별도 local review build에서 제공한다. 기본 student/site 빌드는 실습 바이너리를 공개하지 않는다. 소스 및 다운로드 원본의 commit 계획이 공개 다운로드 승인이나 release를 의미하지 않는다.

## 아직 승인하지 않은 항목과 운영 제한

미승인: 제2일차 이후 본문·커리큘럼, 정식 release, 수강생 공개, 정식 PDF 발행, push/merge/deploy. 검수 PDF는 내부 검수 출력이며 정식 발행 PDF가 아니다.

생성 속도·계정 사용량·업로드 가능 여부에 따라 운영이 달라질 수 있다. 전략 2개와 Prompt 2개는 필수이며 이미지 A/B 2개는 권장 산출물이다. 생성이 지연되면 제공된 강사 예시로 비교하고 자신의 Prompt와 실행 상태를 기록한다. AI 이미지가 실제 면적·구조·동선·설비·법규·시공 적합성을 증명하지 않는다.

## 실제 로컬 commit 이력과 corrective 검증

| 단계 | 실제 SHA / 처리 상태 | message | 파일 수 |
| --- | --- | --- | ---: |
| Commit 1 | `aaa0516483fc6f06926daeca47d9bf69d0134c70` | `chore: prepare Daejeon draft infrastructure` | 4 |
| Commit 2 | `6293427a26604b31e7e10b57bf9636ac00ba74eb` | `feat: preserve Daejeon Day 01 practice assets and sources` | 64 |
| Corrective | `16c13829b5d48ee074284a2dfb6b504d1b4df7fa` | `fix: make Daejeon practice generators self-contained` | 8 |
| Commit 3 | corrective 검증 PASS 후 아래의 정확한 21개 경로를 생성; 문서 자신을 포함하는 SHA는 commit 후 보고 | `feat: add approved Daejeon Day 01 review content and UI` | 21 |

Commit 1·2는 amend하지 않았다. Corrective는 Source 기존 5개 수정 및 신규 3개만 포함하며 PDF·PNG/JPEG·기존 SVG 도면·Prompt·RFP 결과물·Commit 3 UI는 포함하지 않는다. 신규 3개는 A에 포함하고 D 70개 및 E 제외 정책을 유지한다. 관련 파일은 최초 191개에서 194개가 됐으며 A 67 / B 28 / C 29 / D 70이다.

- 형제 worktree 의존성: CF-02 content 입력 및 CF-01 baseline의 sibling `gwangju` 읽기를 제거했다. 현재 checkout 내부 정식 `src/lib/lesson02-ebook.ts`를 기본 입력으로 쓴다. 외부 경로 fallback이나 필수 환경변수는 없다.
- Root 탐색: 스크립트 위치에서 상위를 순회해 `package.json`, `src/lib/lesson02-ebook.ts`, `data/courses`를 함께 찾는다. 실패하면 필요한 marker를 밝힌 오류로 중단한다.
- 광주 보호: 현재 HEAD와 승인 `cdc99d788b9506344872c865730cd9cf002f16ec`의 Lesson 02 Git blob이 정확히 같다. SHA-256 `a9a81a4d8b5f53086e56da202080ab7115d0b1a61e35dfa8c28eccef930d0c9b`. working text는 CRLF/LF 정규화 후 같은 blob 내용임을 별도 확인했다. 외부 worktree filesystem 바이트를 기준으로 사용하지 않는다.
- 실행 순서: repository-local input check → geometry → 생성된 whitebox SVG 존재 확인 → raster → 임시 PNG 크기 검증. Whitebox SVG는 generated intermediate이므로 Git 최초 입력으로 추가하지 않는다.
- 검증 출력은 checkout 밖 임시 디렉토리로만 보낸다. 기존 최종 PDF·도면·현황 이미지·A/B·Prompt는 크기/SHA가 그대로다. 공간 및 카메라 JSON도 같은 값이다. PDF 생성은 실행하지 않았다.
- 검증은 부분 생성·보호 코드의 자립성을 의미한다. 기존 AI 이미지 또는 최종 패키지 전체의 바이트 재현을 뜻하지 않는다. PDF 문서 생성기의 Windows Malgun 폰트 입력은 OS 의존성으로 문서화했으며 이번 실행 대상에서 제외했다.

### Corrective clean checkout 결과

dirty 파일·D/E 사전 복사·sibling `gwangju` 없이 detached clean checkout을 만들었다. `npm ci --no-audit --no-fund`, lint, typecheck, validate:content, validate:courses, build, verify:multi-course, git diff --check가 모두 PASS했다. `python -B scripts/verify-daejeon-generators.py --require-clean`도 PASS: 외부 프로젝트 입력 읽기 0, 기준 blob 일치, CF-01 baseline/verify PASS, geometry → raster PASS, geometry/camera 값 동일, tracked·untracked 변화 0. 테스트용 래스터 PNG 4개는 저장소 밖 출력이며 기존 asset을 덮어쓰지 않는다.

### 최신 corrective Source 크기와 SHA-256

파일시스템 및 `core.autocrlf=false` clean checkout에서 아래 바이트를 확인했다. Source만 변경을 허용했고 과거 중복 hash 부록은 최초 감사 시점 기록으로 남긴다.

| 정확한 Git 경로 | bytes | SHA-256 |
| --- | ---: | --- |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_build.py` | 15020 | `394244064d38732da9cc5cbe3c0f7c6bb92b67d6d8c2cccecc5faca025ecedf8` |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_render.mjs` | 6311 | `de3aa27ff7d806e33b46956e5a73cdcf2a35df75a1b3c5aa0e3f2b04f8927d32` |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_build.md` | 3091 | `05d92ce99af1c76e415ddfc55ab1f2382234f642b66bc2a68fdc48630f14db6c` |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_build.py` | 3424 | `57106568ebec3f706404be8e2e38a3c91f4d6e505d9c15a2f3bd92e1d0baa79b` |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_content.py` | 25489 | `fb4f3e0c1c7e2c02e46747d319c137efdabd7e257d1750781d0b8bcd630dda12` |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_geometry.py` | 8157 | `ecd138a1cddaf97615e9825a80bc6ea39bcdf65ad69af6b0dd70603e583871cd` |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_raster.mjs` | 1553 | `cd7ed73f6c66a5f73401ade831fa7929313608401cf327dfeb4f576646e10a58` |
| `scripts/verify-daejeon-generators.py` | 6297 | `f71ba7ea3b40ee9a87e52c99fb2f8fea2af718dc8116cf5a39aabace09302ce3` |

Commit 3 대상은 기존 21개 경로 그대로다. 승인 문서의 바이트/SHA만 이번 기록 갱신으로 달라진다. course status는 design-pending, release 목록은 비어 있고 정식 PDF는 not-issued다. 제2일차 이후 본문·Gwangju 원본·실습 결과물·전체 승인 콘텐츠에는 변경이 없다. Commit 3의 최종 clean checkout 검사와 SHA는 완료보고로 기록하며 검사 전에 PASS라고 단정하지 않는다.

## 최초 commit 전 감사 결론 (과거 스냅샷)

아래는 저장소 루트 기준 정확한 Git 경로다. 포함 계획만 기록하며 실제 staging이나 commit을 수행한 목록이 아니다. 이미 HEAD에 있는 재사용 파일은 새 복사본을 만들거나 다시 추가하지 않는다.

사전 상태: tracked 376개, tracked 수정 6개, untracked 152개. 승인 문서는 본 단계에서 새로 생성한다.

기존 tracked 수정 6개는 가장 오래된 보존 스냅샷(`tmp/day01-implementation/before.json`)에도 이미 M으로 존재했다. 그 스냅샷은 일부 Day 01 파일을 이미 포함하므로 완전한 작업 착수 전 기준이라고 단정하지 않는다. 이후 바이트 변경과 파일 추가만 확정할 수 있다. 기존 변경을 무관한 변경으로 간주해 원복하지 않는다.

해당 스냅샷 이후: 기존 파일 24개 수정, 17개 추가(본 승인 문서 생성 전 기준). 현재 요청에서는 기존 파일을 바꾸지 않고 이 문서만 추가한다.

현재 source 참조 44개, build 생성 Brief TXT 2개, 전체 review build 파일 46개를 추적했다. 다운로드 URL 45개가 응답하고 원본 해시와 일치한다. 화면의 Prompt TXT 5개는 브라우저 Blob 다운로드로 생성되며 별도 원본 파일 누락이 아니다. import 모듈 28개에서 상대경로 누락과 파일명 대소문자 오류가 없다.

특히 실제 생성 Prompt TXT 4개는 현재 강사 영역의 다운로드 경로가 참조하므로 C에 포함한다. generation log JSON은 D로 제외한다. CF-01 `source/DJ-CF-01_visual-review.json`과 `source/geometry/DJ-CF-01_geometry.json`은 검토 성격도 있으나 현재 문서 생성기가 직접 로드하거나 보호 검사에서 읽으므로 A에 포함한다. 내부 JSON 전체를 일괄 제외하면 재생성 경로가 깨진다.

`scripts/verify-daejeon-protection.mjs`는 ignored tmp의 과거 before.json, 로컬 sibling gwangju 및 현재 고정 HEAD에 의존한다. commit 이후 재현 가능한 표준 검사로 쓰기 어렵기 때문에 D로 분류한다. 이 스크립트를 수정하거나 baseline을 바꾸지 않았다. 후속 명시 승인으로 별도 `scripts/verify-daejeon-generators.py`를 추가했다. 과거 D 스크립트와 baseline은 수정하거나 commit하지 않는다.

`docs/DAEJEON_DAY01_IMPLEMENTATION.md`는 초기 구현 이력으로 C에 보존한다. 그 안의 37개 build 파일·패키지 무수정 설명은 당시 기준이고 현재 최종 상태는 46개 build 파일 및 승인된 CF-02 RFP 개정이다. 현재 승인 범위는 본 문서를 우선한다. 과거 문서는 이번 요청에서 수정하지 않는다.

## 최초 commit 계획과 정확한 포함 목록

원래 예시의 콘텐츠/asset 순서를 바꾼다. 기반 코드를 먼저 넣되 `course.json`의 reviewDraft 활성화는 마지막 콘텐츠 commit에 둔다. 실습자료가 없는 중간 commit에서 새 페이지가 활성화되어 빌드가 실패하지 않도록 한다. HEAD 위에 계획 파일을 겹쳐 보는 읽기 전용 import 의존성 검사에서 세 단계 모두 누락이 없었다. 실제 각 commit의 clean checkout 빌드는 아직 실행하지 않았으며 아래 검증은 향후 실제 commit 직후 수행할 항목이다.

### Commit 1

권장 message: `chore: prepare Daejeon draft infrastructure`

기반 코드 4개만 포함. 과정 활성화·페이지·실습자료·문서는 제외한다.

포함 4개:

```text
scripts/course-registry.mjs
scripts/draft-output.mjs
scripts/run-ebook-mode.mjs
scripts/verify-multi-course.mjs
```

검증: npm run lint; npm run typecheck; npm run validate:content; npm run validate:courses; npm run build; npm run verify:multi-course; git diff --check

### Commit 2

권장 message: `feat: preserve Daejeon Day 01 practice assets and sources`

수강생 다운로드 원본, 최종 강사 참고 및 실습자료 유지보수 source만 포함. review PDF·ZIP·로그·iterations·검증 출력은 제외한다.

포함 64개:

```text
review/daejeon/DJ-CF-01/DJ-CF-01_RFP-draft.pdf
review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-sample.md
review/daejeon/DJ-CF-01/DJ-CF-01_example-A-generation-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_example-A-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_example-A.png
review/daejeon/DJ-CF-01/DJ-CF-01_example-B-generation-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_example-B-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_example-B.png
review/daejeon/DJ-CF-01/DJ-CF-01_examples-guide.txt
review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.pdf
review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.png
review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.svg
review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-01.png
review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-02.png
review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-03.png
review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-execution.txt
review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-from-brief.txt
review/daejeon/DJ-CF-01/DJ-CF-01_participant-worksheet-draft.pdf
review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-core.md
review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-prompt.txt
review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-verified.md
review/daejeon/DJ-CF-01/source/DJ-CF-01_build.py
review/daejeon/DJ-CF-01/source/DJ-CF-01_documents.py
review/daejeon/DJ-CF-01/source/DJ-CF-01_examples.json
review/daejeon/DJ-CF-01/source/DJ-CF-01_practice.json
review/daejeon/DJ-CF-01/source/DJ-CF-01_render.mjs
review/daejeon/DJ-CF-01/source/DJ-CF-01_rfp.json
review/daejeon/DJ-CF-01/source/DJ-CF-01_space.json
review/daejeon/DJ-CF-01/source/DJ-CF-01_view-01-prompt.txt
review/daejeon/DJ-CF-01/source/DJ-CF-01_view-02-prompt.txt
review/daejeon/DJ-CF-01/source/DJ-CF-01_view-03-final-prompt.txt
review/daejeon/DJ-CF-01/source/DJ-CF-01_visual-review.json
review/daejeon/DJ-CF-01/source/geometry/DJ-CF-01_geometry.json
review/daejeon/DJ-CF-02/DJ-CF-02_RFP-draft.pdf
review/daejeon/DJ-CF-02/DJ-CF-02_RFP-source.md
review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-sample.md
review/daejeon/DJ-CF-02/DJ-CF-02_example-A-execution-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_example-A-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_example-A.png
review/daejeon/DJ-CF-02/DJ-CF-02_example-B-execution-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_example-B-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_example-B.png
review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.pdf
review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.png
review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.svg
review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-01.png
review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-02.png
review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-execution.txt
review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-from-brief.txt
review/daejeon/DJ-CF-02/DJ-CF-02_participant-worksheet-draft.pdf
review/daejeon/DJ-CF-02/DJ-CF-02_rfp-analysis-prompt.txt
review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.svg
review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-A-generation-prompt.txt
review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-B-generation-prompt.txt
review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-01-generation-prompt.txt
review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-02-generation-prompt.txt
review/daejeon/DJ-CF-02/source/DJ-CF-02_building-camera.json
review/daejeon/DJ-CF-02/source/DJ-CF-02_content.json
review/daejeon/DJ-CF-02/source/DJ-CF-02_content.py
review/daejeon/DJ-CF-02/source/DJ-CF-02_documents.py
review/daejeon/DJ-CF-02/source/DJ-CF-02_geometry.py
review/daejeon/DJ-CF-02/source/DJ-CF-02_raster.mjs
```

검증: npm run lint; npm run typecheck; npm run validate:content; npm run validate:courses; npm run build; git diff --check; 포함 원본의 SHA 및 문서 생성기 입력 존재 검사(재생성하지 않음)

### Commit 3

권장 message: `feat: add approved Daejeon Day 01 review content and UI`

페이지·UI·asset 연결 코드와 과정 활성화 설정, 승인/운영/최소 재사용 기록을 함께 포함. 정식 release·공개 다운로드·검수 PDF는 제외한다.

포함 21개:

```text
data/courses/daejeon-2026/course.json
docs/DAEJEON_DAY01_APPROVAL.md
docs/DAEJEON_DAY01_IMPLEMENTATION.md
docs/MULTI_COURSE_GUIDE.md
review/daejeon/GW-L02-reuse-audit.json
scripts/build-daejeon-day01-review.mjs
scripts/daejeon-gwangju-reuse.mjs
scripts/daejeon-review-assets.mjs
scripts/preview-daejeon-day01.mjs
scripts/verify-daejeon-review.mjs
src/draft/components/EmptySpaceMaterials.astro
src/draft/components/FlowerCafeDemo.astro
src/draft/components/ProjectMaterials.astro
src/draft/components/ReviewPrompt.astro
src/draft/components/ReviewSection.astro
src/draft/content/daejeon-2026.ts
src/draft/layouts/ReviewLayout.astro
src/draft/pages/course-overview.astro
src/draft/pages/index.astro
src/draft/pages/lessons/01.astro
src/draft/styles/review.css
```

검증: npm run lint; npm run typecheck; npm run validate:content; npm run validate:courses; npm run build; npm run verify:multi-course; local review build; instructor/pdf-review mode build; node scripts/verify-daejeon-review.mjs; git diff --check; 당시 기준의 읽기 전용 Gwangju 보호 검사

Commit 2의 광주 이미지·Prompt 9개는 이미 HEAD에 있으므로 포함 목록에서 빠져도 의존성은 유지된다. `.gitignore`, release.json, pdfs.json 및 Gwangju 기준 파일도 변경 없이 기존 HEAD를 사용한다. 각 commit은 전체 worktree 검사와 별개로 clean checkout에서 검증해야 한다. 과거 tmp 스냅샷이 필요한 검증을 성공했다고 대체하지 않는다.

## 최초 파일 분류표와 corrective 반영

A: source/설정/생성 입력. B: 현재 수강생 실습에서 실제 참조하는 원본. C: 강사 또는 유지보수 가치가 있는 자료. D: Git 제외 권장인 검토/내부 출력. E: 현재 ignored 생성물. M/U/HEAD는 감사 시 상태이며 NEW는 본 문서다. HEAD는 이미 보존되어 있어 신규 commit 목록에 넣지 않는다.

### A: 기존 64개 + corrective 신규 3개 = 67개

| 정확한 Git 경로 | bytes | 상태 | commit | 분류 이유 |
| --- | ---: | --- | --- | --- |
| `.gitignore` | 520 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `astro.config.mjs` | 1390 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `data/asset-manifest.yaml` | 87485 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `data/courses/daejeon-2026/course.json` | 636 | M | 3 | Day 01 활성화 설정; assets/UI와 같은 commit 필요 (이후 수정) |
| `data/courses/daejeon-2026/pdfs.json` | 187 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `data/courses/daejeon-2026/release.json` | 119 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `data/courses/gwangju-2026/course.json` | 3039 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `data/courses/gwangju-2026/pdfs.json` | 10725 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `data/courses/gwangju-2026/release.json` | 403 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `docs/DAEJEON_DAY01_APPROVAL.md` | 본 문서 | NEW | 3 | 본 요청에 따른 승인 범위·commit 계획 기준 문서 (기존) |
| `package-lock.json` | 293974 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `package.json` | 2286 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.svg` | 14668 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_build.py` | 15020 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_documents.py` | 34338 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_examples.json` | 9340 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_practice.json` | 996 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_render.mjs` | 6311 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_rfp.json` | 7455 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_space.json` | 3165 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_visual-review.json` | 4816 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-01/source/geometry/DJ-CF-01_geometry.json` | 2180 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_RFP-source.md` | 5058 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.svg` | 6210 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.svg` | 2564 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_building-camera.json` | 2543 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_content.json` | 10096 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_content.py` | 25489 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_documents.py` | 9605 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_geometry.py` | 8157 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_raster.mjs` | 1553 | U | 2 | 실습자료의 유지보수 원본·생성 코드·필수 로드 입력; 실행 출력과 구분 (기존) |
| `scripts/approved-pdfs.mjs` | 2890 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `scripts/build-daejeon-day01-review.mjs` | 3420 | U | 3 | 현재 페이지·빌드·검증의 실제 import 의존성 (추가) |
| `scripts/build-multi-course.mjs` | 2931 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `scripts/course-registry.mjs` | 8262 | M | 1 | reviewDraft 활성화와 분리 가능한 기반·검증 코드 (이후 수정) |
| `scripts/daejeon-gwangju-reuse.mjs` | 2319 | U | 3 | 현재 페이지·빌드·검증의 실제 import 의존성 (추가) |
| `scripts/daejeon-review-assets.mjs` | 5717 | U | 3 | 현재 페이지·빌드·검증의 실제 import 의존성 (추가) |
| `scripts/draft-output.mjs` | 2900 | U | 1 | reviewDraft 활성화와 분리 가능한 기반·검증 코드 (이후 수정) |
| `scripts/lecture-kit-static.mjs` | 6127 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `scripts/preview-daejeon-day01.mjs` | 1079 | U | 3 | 현재 페이지·빌드·검증의 실제 import 의존성 (추가) |
| `scripts/run-ebook-mode.mjs` | 6203 | M | 1 | reviewDraft 활성화와 분리 가능한 기반·검증 코드 (이후 수정) |
| `scripts/verify-daejeon-review.mjs` | 13167 | U | 3 | 현재 페이지·빌드·검증의 실제 import 의존성 (이후 수정) |
| `scripts/verify-multi-course.mjs` | 16033 | M | 1 | reviewDraft 활성화와 분리 가능한 기반·검증 코드 (기존) |
| `src/components/content/AnnotatedPromptBlock.astro` | 3500 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `src/components/content/PromptCopyBlock.astro` | 7100 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `src/content/lessons/01.mdx` | 58526 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `src/content/lessons/02.mdx` | 25146 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |
| `src/draft/components/EmptySpaceMaterials.astro` | 1375 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (추가) |
| `src/draft/components/FlowerCafeDemo.astro` | 2770 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (추가) |
| `src/draft/components/ProjectMaterials.astro` | 1583 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (추가) |
| `src/draft/components/ReviewPrompt.astro` | 1276 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (추가) |
| `src/draft/components/ReviewSection.astro` | 631 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (기존) |
| `src/draft/content/daejeon-2026.ts` | 10468 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/draft/layouts/ReviewLayout.astro` | 3992 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/draft/pages/course-overview.astro` | 2786 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/draft/pages/index.astro` | 1065 | M | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/draft/pages/lessons/01.astro` | 31267 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/draft/public/robots.txt` | 26 | HEAD | 기존 HEAD | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (기존) |
| `src/draft/styles/review.css` | 9026 | U | 3 | Day 01 draft 페이지·콘텐츠·UI·noindex 경계 (이후 수정) |
| `src/lib/course-overview.ts` | 3984 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `src/lib/courses.ts` | 372 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `src/lib/lesson02-ebook.ts` | 27721 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `src/styles/global.css` | 28084 | HEAD | 기존 HEAD | 현재 페이지·빌드·검증의 실제 import 의존성 (기존) |
| `tsconfig.json` | 440 | HEAD | 기존 HEAD | 과정·재사용·빌드의 기존 기준 파일; 변경 없음 (기존) |

| `review/daejeon/DJ-CF-02/source/DJ-CF-02_build.md` | 3091 | corrective A (신규) | corrective | 자립형 생성 순서·검증 보존 |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_build.py` | 3424 | corrective A (신규) | corrective | 자립형 생성 순서·검증 보존 |
| `scripts/verify-daejeon-generators.py` | 6297 | corrective A (신규) | corrective | 자립형 생성 순서·검증 보존 |

### B: 28개

| 정확한 Git 경로 | bytes | 상태 | commit | 분류 이유 |
| --- | ---: | --- | --- | --- |
| `review/daejeon/DJ-CF-01/DJ-CF-01_RFP-draft.pdf` | 8543814 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.pdf` | 284659 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.png` | 470075 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-01.png` | 2005564 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-02.png` | 1889370 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-03.png` | 1931252 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-execution.txt` | 893 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-from-brief.txt` | 1663 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_participant-worksheet-draft.pdf` | 79086 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-prompt.txt` | 2126 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_RFP-draft.pdf` | 7196080 | U | 2 | 현재 실습 원본/다운로드 참조 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.pdf` | 205235 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.png` | 376699 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-01.png` | 2487662 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-02.png` | 2530182 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-execution.txt` | 754 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-from-brief.txt` | 1230 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_participant-worksheet-draft.pdf` | 87596 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_rfp-analysis-prompt.txt` | 1314 | U | 2 | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/empty-space-sample/02-base-images/base-01.jpeg` | 115546 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/empty-space-sample/02-base-images/base-02.jpeg` | 136483 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/empty-space-sample/02-base-images/base-03.jpeg` | 105693 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/empty-space-sample/02-base-images/base-04.jpeg` | 89031 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/empty-space-sample/02-base-images/base-05.jpeg` | 125833 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/flower-cafe-sample/01-original-prompt.txt` | 79 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/flower-cafe-sample/02-original-result.jpeg` | 244116 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/flower-cafe-sample/03-revision-prompt.txt` | 1260 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |
| `src/assets/lessons/02/flower-cafe-sample/04-revised-result.jpeg` | 281581 | HEAD | 기존 HEAD | 현재 실습 원본/다운로드 참조 (기존) |

### C: 29개

| 정확한 Git 경로 | bytes | 상태 | commit | 분류 이유 |
| --- | ---: | --- | --- | --- |
| `docs/DAEJEON_DAY01_IMPLEMENTATION.md` | 5308 | U | 3 | 운영·구현 이력·재사용 출처/해시의 최소 유지 문서 (추가) |
| `docs/MULTI_COURSE_GUIDE.md` | 5927 | M | 3 | 운영·구현 이력·재사용 출처/해시의 최소 유지 문서 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-prompt.txt` | 1695 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-sample.md` | 13719 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-A-generation-prompt.txt` | 5403 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-A-prompt.txt` | 2114 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-A.png` | 2185490 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-B-generation-prompt.txt` | 6868 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-B-prompt.txt` | 2047 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-B.png` | 2066424 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_examples-guide.txt` | 4178 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-core.md` | 5679 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-verified.md` | 6818 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_view-01-prompt.txt` | 1761 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_view-02-prompt.txt` | 1738 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_view-03-final-prompt.txt` | 1364 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-prompt.txt` | 1171 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-sample.md` | 2751 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-A-execution-prompt.txt` | 841 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-A-prompt.txt` | 1313 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-A.png` | 2367072 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-B-execution-prompt.txt` | 944 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-B-prompt.txt` | 1415 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-B.png` | 2348099 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-A-generation-prompt.txt` | 2346 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-B-generation-prompt.txt` | 2547 | U | 2 | 현재 강사 영역의 실제 참조; 제외하면 기능 누락 또는 빌드 실패 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-01-generation-prompt.txt` | 2030 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-02-generation-prompt.txt` | 1707 | U | 2 | 최종 예시·원본 이미지의 Prompt 또는 강사 분석 참고; 현재 UI 외 유지 가치 (기존) |
| `review/daejeon/GW-L02-reuse-audit.json` | 8995 | U | 3 | 운영·구현 이력·재사용 출처/해시의 최소 유지 문서 (추가) |

### D: 70개

| 정확한 Git 경로 | bytes | 상태 | commit | 분류 이유 |
| --- | ---: | --- | --- | --- |
| `docs/DAEJEON_GWANGJU_ASSET_AUDIT.csv` | 69899 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `docs/DAEJEON_GWANGJU_ASSET_AUDIT.md` | 74563 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `docs/DAEJEON_GWANGJU_DOWNLOAD_CHECK.json` | 6222 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `docs/DAEJEON_LESSON01_REVIEW.md` | 10333 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `docs/DAEJEON_RFP_IMPROVEMENT_REVIEW.md` | 10151 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/COURSE_OVERVIEW_FINAL_CHECK.pdf` | 1026073 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DAEJEON_DAY01_FULL_REVIEW.pdf` | 20959640 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DAEJEON_DAY01_FULL_REVIEW_v2.pdf` | 29719385 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DAEJEON_DAY01_MOBILE_REVIEW.pdf` | 7508467 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DAEJEON_DAY01_MOBILE_REVIEW_v2.pdf` | 8996845 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_README.txt` | 8033 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_downloads.txt` | 4456 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_participant-revision-report.md` | 14224 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_review.html` | 38561 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-sample.md` | 12515 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-validation.md` | 7733 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-brief-workflow-review.md` | 20456 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_asset-inventory.json` | 6475 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_example-A-attempt-01-prompt.txt` | 4168 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_example-B-attempt-01-prompt.txt` | 5556 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_example-generation-log.json` | 30200 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_generation-log.json` | 1756 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_package-manifest.json` | 10798 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_participant-revision-validation.json` | 4468 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_preview-check.json` | 5963 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_protection-check.json` | 272 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_validate-participant-revision.py` | 10597 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_validate.py` | 13126 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_validation.json` | 9680 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_view-03-correction-prompt.txt` | 1172 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/DJ-CF-01_view-03-prompt.txt` | 1726 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/geometry/DJ-CF-01_whitebox-01.png` | 54923 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/geometry/DJ-CF-01_whitebox-02.png` | 70366 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/geometry/DJ-CF-01_whitebox-03.png` | 68966 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_example-A-attempt-01.png` | 2107634 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_example-B-attempt-01.png` | 2101776 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_view-03-attempt-01.png` | 1988991 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_view-03-attempt-02.png` | 1848327 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_README.md` | 3152 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_START-HERE.txt` | 1315 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_interior-exterior-card.md` | 1857 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_manifest.json` | 10005 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_package-report.md` | 27447 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_participant-package.zip` | 11107646 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_prompt-practice.txt` | 2515 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_review-package.zip` | 26971888 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_review.html` | 29793 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.png` | 79266 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_analysis-verified.md` | 2845 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_check-results.json` | 466 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_generation-log.json` | 14682 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_gwangju-source-check.json` | 1072 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_visual-review.json` | 5114 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.png` | 86353 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.svg` | 3001 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.png` | 179747 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.svg` | 2988 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_browser-check.mjs` | 4211 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_downloads.json` | 2984 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_evidence.py` | 4855 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_pdf-layout-check.json` | 5873 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_preview-check.json` | 3986 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_report.py` | 11175 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_review.py` | 16330 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_revision-02-validation.json` | 1186 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_validate.py` | 6879 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (이후 수정) |
| `review/daejeon/DJ-CF-02/source/DJ-CF-02_validation.json` | 2439 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/exports/DJ-CF-01_AB-review.zip` | 16868811 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `review/daejeon/exports/DJ-CF-01_Brief-Prompt-review.zip` | 9662 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (기존) |
| `scripts/verify-daejeon-protection.mjs` | 4194 | U | 제외 | 과거 검토·감사·패키지 출력; 현재 Day 01 실행 의존성 아님 (추가) |

### E: ignored 경로

아래 실제 ignored 루트의 모든 하위 파일을 Git에서 제외한다. 재생성 출력과 의존성 파일을 수강생 원본 asset과 혼동하지 않는다. 파일 수/용량은 사전 감사 시점이며 본 단계의 추가 tmp 검증 기록은 같은 E 정책에 포함한다.

| 정확한 루트 경로 | 파일 수 | bytes | 의미 |
| --- | ---: | ---: | --- |
| `.astro/` | 9 | 29535 | 생성 타입 |
| `dist/` | 4958 | 1119513540 | 빌드 및 preview 출력 |
| `instructor-content/` | 6 | 2185008 | 로컬 전용 강사 메모; 기존 정책 유지 |
| `node_modules/` | 18791 | 362952794 | 의존성·캐시 |
| `tmp/` | 3491 | 650311079 | 캡처·중간 PDF·검증 스냅샷·본 감사의 재생성 기록 |

E 전체 디렉토리에 대한 현재 ignore 정책을 유지한다. 개별 생성 파일을 stage하지 않는다. ignored 파일의 별도 보존 필요 여부는 이후 정리 단계에서 판단하며 이번에 삭제하거나 이동하지 않는다.

## 대용량 및 중복 binary 감사

기준: [GitHub 공식 대용량 파일 안내](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). 일반 Git 파일은 50 MiB 초과 시 경고, 100 MiB 초과 시 차단된다. 이번 관련 nonignored 파일에는 두 기준을 넘는 파일이 없다. GitHub 웹 업로드의 별도 25 MiB 제한을 Git push 제한과 혼동하지 않는다.

| 정확한 파일 경로 (1 MiB 이상) | MiB | 분류 | 판단 |
| --- | ---: | --- | --- |
| `review/daejeon/DAEJEON_DAY01_FULL_REVIEW_v2.pdf` | 28.343 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_review-package.zip` | 25.722 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DAEJEON_DAY01_FULL_REVIEW.pdf` | 19.989 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/exports/DJ-CF-01_AB-review.zip` | 16.087 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_participant-package.zip` | 10.593 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DAEJEON_DAY01_MOBILE_REVIEW_v2.pdf` | 8.580 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_RFP-draft.pdf` | 8.148 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DAEJEON_DAY01_MOBILE_REVIEW.pdf` | 7.161 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_RFP-draft.pdf` | 6.863 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-02.png` | 2.413 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-01.png` | 2.372 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-A.png` | 2.257 | C | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_example-B.png` | 2.239 | C | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-A.png` | 2.084 | C | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_example-A-attempt-01.png` | 2.010 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_example-B-attempt-01.png` | 2.004 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_example-B.png` | 1.971 | C | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-01.png` | 1.913 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_view-03-attempt-01.png` | 1.897 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-03.png` | 1.842 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-02.png` | 1.802 | B | 실제 사용 원본/강사 예시 보존 |
| `review/daejeon/DJ-CF-01/source/iterations/DJ-CF-01_view-03-attempt-02.png` | 1.763 | D | 재생성 검수 출력 또는 미채택 이미지; Git 제외 |

D 제외 후보 합계 126.179 MiB. 수강생 원본 RFP·도면 PDF는 재생성 가능하더라도 현재 직접 다운로드 대상이므로 B로 보존한다. 가장 큰 필수 원본은 CF-01 RFP 8.148 MiB다. 현재 규모에서 필수 asset 때문에 LFS가 필요하다는 근거는 없다. 원본 source와 승인된 다운로드 PDF는 역할이 달라 둘 다 보존한다.

관련 nonignored 파일의 동일 SHA-256 중복 그룹: 0개. 현재 source와 동일한 ignored dist/tmp 복사본: 100개. 이 복사본은 build·검증 용도이며 별도 commit하지 않는다. 광주/Daejeon worktree의 같은 tracked 파일은 공유 Git object의 각 checkout으로 구분한다.

ZIP 내부의 현재 파일과 동일 SHA-256 항목:

| ZIP 경로 | 항목 수 | 현재 파일과 동일한 항목 | 판단 |
| --- | ---: | ---: | --- |
| `review/daejeon/DJ-CF-02/DJ-CF-02_participant-package.zip` | 15 | 15 | 원본 재포장 또는 이전 export; 현재 e-book 다운로드에 미참조, D 제외 |
| `review/daejeon/DJ-CF-02/DJ-CF-02_review-package.zip` | 58 | 58 | 원본 재포장 또는 이전 export; 현재 e-book 다운로드에 미참조, D 제외 |
| `review/daejeon/exports/DJ-CF-01_AB-review.zip` | 17 | 14 | 원본 재포장 또는 이전 export; 현재 e-book 다운로드에 미참조, D 제외 |
| `review/daejeon/exports/DJ-CF-01_Brief-Prompt-review.zip` | 5 | 5 | 원본 재포장 또는 이전 export; 현재 e-book 다운로드에 미참조, D 제외 |

ZIP CRC 검사도 통과했다. AB-review ZIP의 나머지 3개는 현재 개별 파일과 byte 동일하지 않은 export 구성이다. 누락된 수강생 다운로드로 보지 않는다. 복사본·ZIP·미채택 이미지는 이번에 삭제하지 않는다.

## .gitignore 검토 및 향후 권고

현재 dist/tmp/.astro/node_modules/instructor-content는 ignored이고 review/는 ignored가 아니다. 현재 학생용 원본이 review/ 아래에 있으므로 review/ 전체를 ignore하면 필수 다운로드와 페이지의 readFileSync 의존성이 빠진다. 이번에는 .gitignore를 수정하지 않는다.

안전하게 제안할 수 있는 선택적 패턴은 아래와 같다. 실제 반영 전 이 문서의 A/B/C 경로가 제외되지 않는지 git check-ignore로 검토한다.

```gitignore
/review/daejeon/DAEJEON_DAY01_*REVIEW*.pdf
/review/daejeon/COURSE_OVERVIEW_FINAL_CHECK.pdf
/review/daejeon/exports/
/review/daejeon/**/*.zip
/review/daejeon/**/source/iterations/
```

나머지 D 로그·검증 JSON·임시 문서·일회성 검사 script는 위 분류표의 정확한 파일 목록으로 제외한다. 모든 PDF, PNG, source/, instructor/, generation-prompt.txt 또는 JSON을 일괄 ignore하지 않는다. B 원본 PDF·이미지와 C 최종 Prompt, A 필수 로드 JSON이 섞여 있기 때문이다.

현재 로컬 review build의 복사 구조는 원본 A/B/C를 직접 참조하므로 유지한다. 추후 review-only와 실습 원본의 디렉토리 구조를 분리하려면 참조 코드·allowlist·SHA 검사를 함께 보완해야 한다. 이번에는 이동·삭제·파일명 변경을 수행하지 않는다.

## 최초 문서 작성 단계의 검증·보호 방식 (과거 기록)

요청된 lint/typecheck/validate:content/validate:courses/build/git diff --check를 현재 전체 worktree에서 실행하고 완료보고에 결과를 기록한다. 현재 기준의 Gwangju 파일 354개와 Daejeon 기존 파일, Git index hash 및 HEAD를 사전 스냅샷과 비교한다. 승인 문서 생성 외의 기존 파일 변경이나 새로운 nonignored 파일이 없어야 한다. 실제 stage/commit은 하지 않는다.

## 부록: 최초 감사 시점 동일 SHA-256 복사본 목록 (과거 기록)

아래 표는 corrective 이전의 과거 hash 스냅샷이다. 수정된 Source 5개의 현재 크기·hash는 위 최신 Source 표를 우선한다. 관련 nonignored 원본끼리는 당시 동일 hash 중복이 없었다. 아래 79개 hash 그룹은 원본과 ignored 복사본의 동일성을 기록한다. 복사본 100개(dist 49개, tmp 51개)는 E로 분류하고 commit하지 않는다. 파일을 제거하거나 이동한 기록이 아니다.

| SHA-256 | 원본 Git 경로 | 동일한 ignored 복사본 경로 |
| --- | --- | --- |
| `003198069e1023539b063a02d3d210a9551dc23e61991f12b22b02a421a96501` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-B-generation-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-B-generation-prompt.txt` |
| `03418fb16db4bc8139a86ffd057a38e155cecb78116abe11c33af0df08cecd3e` | `src/draft/pages/index.astro` | `tmp/day01-revision/before/src/draft/pages/index.astro` |
| `03a926219e8057a1da9e7acaedf2a274479b158fae61c9cd9703ab7bb85e59b9` | `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.svg` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.svg` |
| `04220fd1050b08640e56b204a6000f9203cac31429e7fc39235b74551b29337f` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-A.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-A.png` |
| `0aae9786cc9017979e6b610934a8e5d5e901cfcd2637e25c91ba2a8d57bdda82` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_validation.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_validation.json` |
| `0f5e1d1470c99a8f8c1d7a012b27844b5bb4e58e1b787a668ea6e5c474f12550` | `review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_existing-plan.pdf` |
| `15515ffe6279bc8215b4ed79a419eacbec06f29ab26a93e535cc0baacc2efe39` | `review/daejeon/DJ-CF-02/DJ-CF-02_interior-exterior-card.md` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_interior-exterior-card.md` |
| `1613e5451da8a8c95a54848f68ff2ccc5371fb6744d9a75d3c6449c9715484ee` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-A-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-A-prompt.txt` |
| `17afd4ed3281e6300638f87f189f9189a3921a4bb5643ddf930ed125decb2f3a` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-02-generation-prompt.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-02-generation-prompt.txt` |
| `1e038d17b78dff89c5536b030c98f276c59037e9bff5c7298815a8a6c0cc28d7` | `review/daejeon/DJ-CF-02/DJ-CF-02_prompt-practice.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_prompt-practice.txt` |
| `230c69e185eaa2cfa66d766cc4b9b89f6da48e70ecd5f483964431537b56ae2f` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_browser-check.mjs` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_browser-check.mjs` |
| `2572cf87468745c3be57ee357a338c864b12d3a2ae0b8bd341ecf1cb68d13892` | `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_existing-elevation.pdf`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.pdf` |
| `25f27d1926a498c0b53facc2e76a43deff1819be33720535a6fdc2f097d98b68` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-B-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-B-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-B-prompt.txt` |
| `27365f7136e390e63985ce2d89ffe2a0ae4694f506df3e76e1624731a6fd13f6` | `review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_design-brief-prompt.txt` |
| `274e6dc7bcfdb7a9525506b3ba263be7365cf5fbe7af9e7b638035e03b6d7f7b` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_visual-review.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_visual-review.json` |
| `279c370dd181df090d24857ac534f6b520f3b227d76a8b3cbae46d7f3da05965` | `review/daejeon/DJ-CF-01/DJ-CF-01_design-brief-sample.md` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_design-brief-sample.md` |
| `2856e068d076b1760a7aeb4687112840c27700fd205989bb8ae6bc074fc091ea` | `review/daejeon/DJ-CF-02/DJ-CF-02_RFP-draft.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_RFP-draft.pdf` |
| `303ef0237da91bded9abe31cd535e4bfd1d2c86db54195b0319a15a14fe54864` | `review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.png` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_existing-elevation.png`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.png` |
| `331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1` | `src/draft/public/robots.txt` | `dist/daejeon-2026/instructor/robots.txt`<br>`dist/daejeon-2026/pdf-review/robots.txt`<br>`dist/daejeon-2026/review/robots.txt`<br>`dist/daejeon-2026/student/robots.txt`<br>`dist/site/daejeon/robots.txt`<br>`tmp/day01-revision/before/src/draft/public/robots.txt` |
| `3503c3baa40afb31965541edc92f8c66b328247068dafb3fecbd35e998272602` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-B-execution-prompt.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-B-execution-prompt.txt` |
| `3bc7c8d456786289e184c50fcfa699882c1e31ffd0329ecb44bdcb05d12f079d` | `review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.svg` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.svg` |
| `3c40d4e4f9453d0425e428ce1f714f20485948d2899cfbdda99b66f8c5a4e992` | `review/daejeon/DJ-CF-02/DJ-CF-02_participant-worksheet-draft.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_participant-worksheet-draft.pdf`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_participant-worksheet-draft.pdf` |
| `4696cbdccdb570b2ccaa7c6178845cb367a8caa8af719c5e74fbb93ced7407e2` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-B.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-B.png` |
| `46ba6d8a11c65e0b6681e07fd6431b4a8fcee6525741270efda7ca6611155433` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_evidence.py` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_evidence.py` |
| `4811ed9e74d2ef6aab2b6d0f7e95fa60964fe8cf91927e24180b6bd107643ee7` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-B.png` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-B.png`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-B.png` |
| `4cb5ad7f1cd477132944a624056f5748b624c5e1215c8a98c9900ce9ee6280f3` | `src/assets/lessons/02/empty-space-sample/02-base-images/base-03.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/base-03.jpeg` |
| `50abd4d63b2e26474c45e8d59bcfed5d4d1c79ac2273566f86f8f7a5e8a5d8b1` | `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-03.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_existing-view-03.png` |
| `53d4e986a9ab62c826515aad7fcdec0f753975b1fadf96ab27b118994c3ca06b` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-A.png` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-A.png`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-A.png` |
| `5403a0756bd657386a27cc84e6707b1c5e411e74bec3ab8ae2081c7d52af07a4` | `src/assets/lessons/02/empty-space-sample/02-base-images/base-04.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/base-04.jpeg` |
| `5614a85b3128fa64b9100e58de7e02f3ab813c9e2db893115bc0a22f3e49892d` | `src/assets/lessons/02/flower-cafe-sample/01-original-prompt.txt` | `dist/daejeon-2026/review/practice/GW-L02/01-original-prompt.txt` |
| `572053cb69f9b4e712346c78ad13ed1c807d0504973d097af88480b4d62b908b` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-B-generation-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-B-generation-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-B-generation-prompt.txt` |
| `5e41b23eb97dc76831ef38b52fc1f3debcf17193e5a039d3e33793d88d61c096` | `src/assets/lessons/02/flower-cafe-sample/02-original-result.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/02-original-result.jpeg` |
| `5f52db84e7c9172daeeb6f49377ae57fe9a802a8fefb7036e0f17471b660859f` | `review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-from-brief.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_image-prompt-from-brief.txt` |
| `5fa0bab72e8a8df8d6da155b523b9618bda5d257463aceab8f66a07f053e74a1` | `src/assets/lessons/02/flower-cafe-sample/03-revision-prompt.txt` | `dist/daejeon-2026/review/practice/GW-L02/03-revision-prompt.txt` |
| `623c00fe09d990d18485e4348109be233ed1f015772395c4f1edd65aaa225ea2` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_preview-check.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_preview-check.json` |
| `641962de4c25699f25303866be27afb874a1c0f198110090dfb179a09e271d43` | `review/daejeon/DJ-CF-01/DJ-CF-01_RFP-draft.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_RFP-draft.pdf` |
| `6510bb280442c31c71bddbff573b480b77eb0797617b08b97e7149402fee43cd` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_downloads.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_downloads.json` |
| `68ca5d0ed767e43db413cd7b9f7b5c8bf5f358bce570d24bfd7780c03316ff1a` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_gwangju-source-check.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_gwangju-source-check.json` |
| `6a855494b58ef52f3ad035cc0a8494bd62e0c0239a83f59b6d0d658b991afb7f` | `scripts/daejeon-review-assets.mjs` | `tmp/day01-revision/before/scripts/daejeon-review-assets.mjs` |
| `6b1c14991f2455b2d07aeaf6a7b330372ad9c632f146a64974d54b8b89ac2ad6` | `review/daejeon/DJ-CF-02/DJ-CF-02_rfp-analysis-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_rfp-analysis-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_rfp-analysis-prompt.txt` |
| `6c6c2c50299a24bc623e8ecb3f91615f58cf7fcc9b70e375c873b059cd1ee269` | `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-01.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_existing-view-01.png` |
| `79e66e751e7c9dbce017144c842d7ceb89632e680836446873655b8c01723ca7` | `src/assets/lessons/02/empty-space-sample/02-base-images/base-01.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/base-01.jpeg` |
| `7f06d2360c401cb81b5e8d5a4489ba5653d783124bea8d8cdaee5e97e1e453ce` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_check-results.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_check-results.json` |
| `7f5e99101779f12a197559c742a430c1848b0d1f048b2e039acdb49182f6856f` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_generation-log.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_generation-log.json` |
| `7fcddac73ea7329679639abce28ad9887fcb1dcb1a2bd4f68bfe9c935db0c21a` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-01-generation-prompt.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_existing-view-01-generation-prompt.txt` |
| `88355ede781da27d9118b795c3f5bdd79e66d5b9f7df341b4285a3e9b282ca6f` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-A-execution-prompt.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-A-execution-prompt.txt` |
| `89039bbf2b4c57f033f37e413aac62edc0d59d97b7c64be66fe9b9e3ac5e6200` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_raster.mjs` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_raster.mjs` |
| `950cf7c883aa87f4744168731da878cc88d48c3d4867ab6485895b1a27b9f89b` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-A-generation-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-A-generation-prompt.txt` |
| `96323613052eceb7a8e146793adeb7140e4aac41d94e43af7b07ef8e348e985f` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_report.py` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_report.py` |
| `982028e159f6f9cce86f3bcb0966a3a6deec6ad481f4694609465fad2c3a63c0` | `review/daejeon/DJ-CF-01/DJ-CF-01_image-prompt-execution.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_image-prompt-execution.txt` |
| `98bd150fa388085868b91f740359728be522bc01d505d83cbb1201e3d205f193` | `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-02.png` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_existing-view-02.png`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-02.png` |
| `9f6953d93c1c7b440155c14c744899aaaa80ba54fa81d874a48fddd51dd6ee9c` | `review/daejeon/DJ-CF-01/DJ-CF-01_rfp-analysis-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_rfp-analysis-prompt.txt` |
| `a50f21035b0629a3a34cc38cf949cb92a7c4f57ba377b5be8cd067b104e1b0cf` | `review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_existing-plan.png` |
| `a7eeaf62441041de43778068c1db2f3c02ed45c09a8964e666b4b0b4350133fc` | `src/assets/lessons/02/empty-space-sample/02-base-images/base-02.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/base-02.jpeg` |
| `ac1b728aa6451ced633e551677ef4cff737d0937ee9a3a370c800d0c59c9f655` | `review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-01.png` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_existing-view-01.png`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_existing-view-01.png` |
| `b37958656c8fa7d3bdc30992e404cad3dcccb0f486b68a09067eb573bc4154e8` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-A-generation-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-A-generation-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_example-A-generation-prompt.txt` |
| `b48d80af7a4ba9a277d65dc7a5bcce67f4bebb2bac8b3248557436eb21d3b773` | `review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.png` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_site-diagram.png` |
| `b50a9f8d380c5a4d583459abf6ebc89ee47843d6597a0ccd9669fefc1b36bea2` | `src/draft/components/ReviewPrompt.astro` | `tmp/day01-revision/before/src/draft/components/ReviewPrompt.astro` |
| `b5f501ee4cbd5af0b51ad6a34194d918eb38a47d3731ddc889333cfbea03b406` | `review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-execution.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_image-prompt-execution.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-execution.txt` |
| `b940a649386cf6c1c6ce135304947ebaa31f95b367881a7bca893043f563fb13` | `review/daejeon/DJ-CF-01/DJ-CF-01_example-B-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_example-B-prompt.txt` |
| `b99d1b0d3e1c08acb70da9479e51f97e38193fb265872c51a7499e5e2dfd98c1` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.png` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.png` |
| `be29ef6316b46fe49c42c5e6cc0ee64923f57376ac2c851fbcb8b5aa7eb6e086` | `src/draft/components/ReviewSection.astro` | `tmp/day01-revision/before/src/draft/components/ReviewSection.astro` |
| `bf68892a2efa65d7c97c49c7764764a608a3428f2c5d83150662fd8be7cc5091` | `review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_design-brief-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-prompt.txt` |
| `bf6f8c7c10c4871898ed7840811785383bf5c57078920d1c10252d813720a245` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.svg` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.svg` |
| `c68857b55ef8ad27c539ae48f40d44e4d619be1139a69e91bd9e595fdfefc3d7` | `src/draft/components/ProjectMaterials.astro` | `tmp/day01-revision/before/src/draft/components/ProjectMaterials.astro` |
| `c6fc4435038d50292b11c33eea3e4a533b6a7c0639a216df1aba1684c63ea21c` | `src/assets/lessons/02/flower-cafe-sample/04-revised-result.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/04-revised-result.jpeg` |
| `cc8ca897126938219403f49af8afb1e2b51f997ab7e9130691b93374cdd0c3a0` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.png` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-01.png` |
| `cfa2b029d3ef2c37bba9642844456f3a82d2decdbac1b68f664027279981f664` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.svg` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_whitebox-02.svg` |
| `d71938f0f0a4a888b21e6939a14df8798aa00a2c579c73f5290eb5300cf0a10e` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_building-camera.json` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_building-camera.json` |
| `d91789f6cda7b0eafd9e5699a535fbdcaeda36e7be4143597c1d081da7231cdd` | `review/daejeon/DJ-CF-02/DJ-CF-02_example-A-prompt.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_example-A-prompt.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_example-A-prompt.txt` |
| `d9682ec112386c2d2e58ded5402abab1dfed47a107e660a8af35c261ac96b63c` | `review/daejeon/DJ-CF-01/DJ-CF-01_existing-view-02.png` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_existing-view-02.png` |
| `dcf7c0c91cbe75728c3a04598fbb4ac773ac39a5e10ad2bf6d9fa71f1863bb94` | `review/daejeon/DJ-CF-02/source/DJ-CF-02_geometry.py` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/source/DJ-CF-02_geometry.py` |
| `e1855d9fe6660a5ba6b70e93fabbdfc9cc7ee8374bcff5c06f12d8582bc9d01c` | `review/daejeon/DJ-CF-02/DJ-CF-02_START-HERE.txt` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_START-HERE.txt` |
| `e99054f8ffadff8d7fb435f227cd2d05db6e92705f90a6e8ad0ed1105cdd3ef4` | `review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-sample.md` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_design-brief-sample.md`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_design-brief-sample.md` |
| `eb3a2a80e8f0d913ae80c81b0296ea3ffa9fab06a0c7c3bc064d8fdfa783f3b8` | `review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-from-brief.txt` | `dist/daejeon-2026/review/practice/DJ-CF-02/DJ-CF-02_image-prompt-from-brief.txt`<br>`tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_image-prompt-from-brief.txt` |
| `ebc7594cb093daec642c6772ba352726162a5aea4e6d5cf53b36e3e7262af72c` | `review/daejeon/DJ-CF-01/DJ-CF-01_participant-worksheet-draft.pdf` | `dist/daejeon-2026/review/practice/DJ-CF-01/DJ-CF-01_participant-worksheet-draft.pdf` |
| `ed64d44bc43bb412e6d355c146d6f6f721a5f9d85694c491df2bea872145ffac` | `review/daejeon/DJ-CF-02/DJ-CF-02_README.md` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/DJ-CF-02_README.md` |
| `efd31ee93536c56709d69fdb20f1f4a0006fed2da59d1bfcc4d036b128b9998c` | `review/daejeon/DJ-CF-02/instructor/DJ-CF-02_analysis-verified.md` | `tmp/day01-revision/before/review/daejeon/DJ-CF-02/instructor/DJ-CF-02_analysis-verified.md` |
| `f50c4a8a41870395affa318a5fa7145a7c02aadbf6ee42d66415f0192806854c` | `src/assets/lessons/02/empty-space-sample/02-base-images/base-05.jpeg` | `dist/daejeon-2026/review/practice/GW-L02/base-05.jpeg` |

Ignored 영역의 50 MiB 초과 파일: 6개. 이 파일들은 E이며 일반 Git commit 대상이 아니다.

| 정확한 ignored 경로 | MiB |
| --- | ---: |
| `dist/gwangju-2026/instructor/downloads/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
| `dist/gwangju-2026/pdf-review/downloads/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
| `dist/gwangju-2026/student/downloads/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
| `dist/site/downloads/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
| `dist/site/gwangju/downloads/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
| `tmp/approved-pdfs/gwangju-2026/ai-architecture-design-course_2026-08-27.pdf` | 54.306 |
