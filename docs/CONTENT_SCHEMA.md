# 콘텐츠 스키마

## 1. 기본 원칙

실제 콘텐츠는 `src/content/`의 MDX로 관리하며 UI 코드와 분리합니다. 승인되지 않은 전문정보, 사실, 출처는 작성하지 않습니다. 자료가 없는 필드는 `pending` 또는 `null`로 명시하고 위험이 없다고 추정하지 않습니다.

## 2. 컬렉션과 렌더링

| 컬렉션 | 폴더 | 페이지 |
| --- | --- | --- |
| `lessons` | `src/content/lessons/` | `/lessons/[id]/` |
| `glossary` | `src/content/glossary/` | `/glossary/` |
| `prompts` | `src/content/prompts/` | `/prompts/` |
| `troubleshooting` | `src/content/troubleshooting/` | `/troubleshooting/` |
| `updates` | `src/content/updates/` | `/updates/` |

각 페이지는 Astro 7 Content Collections의 `render(entry)`가 반환한 `<Content />`를 출력합니다.

## 3. 강의 frontmatter 예시

```yaml
---
title: "제1차시 · 내용 검토 예정"
day: 1
date: "pending"
durationMinutes: null
lastVerified: null
draft: true
contentType: "pending"
authorship: "pending"
verificationStatus: "pending"
freshness: "pending"
riskLevel: "pending"
professionalReviewStatus: "pending"
professionalReviewScope: []
sources: []
---
```

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `title` | non-empty string | 페이지 제목 |
| `day` | integer 1–14 | 차시 번호 |
| `date` | `YYYY-MM-DD` 또는 `pending` | 수업일 |
| `durationMinutes` | positive integer 또는 `null` | 수업시간(분) |
| `lastVerified` | `YYYY-MM-DD` 또는 `null` | 마지막 검증일 |
| `draft` | boolean | 검토 전 초안 여부 |
| `contentType` | enum | 콘텐츠의 의미 유형 |
| `authorship` | enum | 작성 방식 |
| `verificationStatus` | enum | 사실 검증 상태 |
| `freshness` | enum | 최신성 민감도 |
| `riskLevel` | enum | 위험도 |
| `professionalReviewStatus` | enum | 전문가 검토 상태 |
| `professionalReviewScope` | non-empty string[] | 전문 검토가 필요한 구체적 범위 |
| `sources` | source object[] | 승인된 구조화 출처 |
| `sections` | `{ id, label }[]` optional | MDX 구성에 맞춘 로컬 목차 |

`highRiskContent`와 `requiresProfessionalReview` boolean은 사용하지 않습니다. 누락 시 자동 `false`가 되어 미검토 상태를 안전하다고 오해하게 만들 수 있기 때문입니다.

## 4. 상태 값

```text
contentType:
  pending | factual | interpretation | design-proposal | instruction

authorship:
  pending | human | ai-assisted | ai-generated

verificationStatus:
  pending | mixed-verification | course-definition | standard-public-reference | source-checked |
  official-source-checked | expert-reviewed

freshness:
  pending | stable | update-sensitive

riskLevel:
  pending | low | high

professionalReviewStatus:
  pending | required | not-required | completed
```

용어 사전의 개별 항목은 문서 전체의 `mixed-verification` 상태와 별도로
다음 `definitionBasis` 중 하나를 반드시 사용한다.

```text
official-source | standard-public-reference | course-definition
```

- `official-source`: 해당 기관·제품의 공식 문서로 대조
- `standard-public-reference`: 표준 또는 공공기관 자료를 참고
- `course-definition`: 승인된 강의의 실습·분류 범위에서 정의

서로 다른 의미를 한 필드에 섞지 않으며 한 콘텐츠에 여러 배지를 동시에 표시합니다. `riskLevel: pending`은 “검토 대기”로 표시합니다. `professionalReviewStatus`가 `required` 또는 `completed`일 때만 해당 확정 배지를 표시합니다.

`required` 또는 `completed`에는 비어 있지 않은 `professionalReviewScope`가 필요합니다. 이 목록은 차시 전체가 외부 승인을 받아야 한다는 뜻이 아니라 법규, 구조, 소방, 접근성, 자재 성능, 시공 가능성 등 검토할 문구나 판단의 범위를 지정합니다.

`draft`는 콘텐츠 검토 상태를 기록하는 메타데이터입니다. 학생용·강사용 정적 빌드는 동일하게 제1–14차시 라우트, 홈·커리큘럼 목록, 사이드바·모바일 목차, 검색 인덱스를 생성합니다. 두 빌드의 차이는 로컬 강사 메모 포함 여부뿐입니다.

## 5. 구조화 출처

```yaml
sources:
  - id: "source-id"
    title: "승인된 출처 제목"
    publisher: "발행기관"
    url: "https://example.com"       # optional
    accessedAt: "2026-07-28"         # optional
    sourceType: "official"
    note: "승인된 메모"               # optional
```

`sourceType`은 `official`, `documentation`, `standard`, `research`, `reference`, `other` 중 하나입니다. 실제 출처는 승인된 자료를 받은 뒤에만 추가합니다.

## 6. MDX 섹션 조합

`src/components/content/`에는 학습 목표, 용어, 결과물, 이론, 시연, 실습, 프롬프트, 사례, 사실 검증, 주의사항, 체크리스트, 확인 문제, 파일 블록이 분리되어 있습니다.

제1차시는 승인된 상세 원고에 따라 `LessonSection.astro`를 조합한 16개 섹션을 사용합니다. 제2–14차시는 승인된 커리큘럼의 검토용 골격으로 `LessonOutline.astro`를 유지합니다. 공통 골격은 차시 소개, 핵심 질문, 학습 목표, 핵심 개념, 가상 문제, 제공 자료, 시연, 실습, 결과물, 판단 항목, 오류 체크, 필요 자산, 검증 필요 항목으로 구성됩니다. 스키마는 이 13개 섹션을 향후 상세 콘텐츠에 강제하지 않습니다.

제작되지 않은 시각·영상·문서 자료는 `LessonAsset.astro` 플레이스홀더로만 표시합니다. MDX에는 `assetIds`만 두고 제목, 유형, 목적, 제작 도구, 상태, 공개 사용 여부와 대체 텍스트는 `data/asset-manifest.yaml`에서 불러옵니다.

강사 메모는 MDX 본문에 직접 작성하지 않습니다. 공통 본문에는 `InstructorNoteSlot.astro`의 슬롯 ID만 두고, 실제 메모는 Git에서 제외된 `instructor-content/lessons/<id>.yaml`에서 강사용 로컬 빌드 시에만 읽습니다. 공개 예시 스키마는 `instructor-content.example/`에 유지합니다. 자세한 경계와 빌드 규칙은 `docs/INSTRUCTOR_MODE_ARCHITECTURE.md`를 따릅니다.

자산 감사 필드는 다음 enum을 사용합니다.

| 필드 | 허용값 | 의미 |
| --- | --- | --- |
| `priority` | `required`, `optional`, `reference-only` | 실습 필수, 보조 선택, 권리 확인 전 참고 전용 |
| `source_type` | `original`, `external-reference`, `template` | 자체 제작물, 외부 참고물, 빈 양식 |
| `production_owner` | `codex`, `instructor`, `nano-banana`, `veo` | 제작 또는 선별 책임 주체 |
| `lesson_usage` | `demonstration`, `practice-input`, `result-sample`, `checklist` | 수업에서의 사용 역할 |

`reference-only` 자산은 반드시 `external-reference`로 분류하며 삭제·공개 복사·학생 배포하지 않습니다. 제작 우선순위와 중복 제안은 `docs/CURRICULUM_REVIEW.md`에서 검토하고 사용자 승인 후 반영합니다.

`public_use`는 다음 조건으로 검증합니다.

- `not-created`, `awaiting-rights-review`, `reference-only-unverified`, `actual-environment-validation-required` 등 미제작·미검증 상태는 `false`
- `source_type: "external-reference"`인 외부 참고 자산은 `false`
- `true`는 `status: "ready"`에서만 허용
- `true`인 자산은 비어 있지 않은 `source_note`, `rights_status: "cleared"`, `YYYY-MM-DD` 형식의 `verified_at`, 검증 내용을 담은 `verification_note`가 필요
- `ready`라도 공개 승인이 보류됐다면 `public_use: false`를 유지할 수 있음

콘텐츠 판단 표시는 포괄적인 “전문가 검토 필요” 하나로 처리하지 않습니다. 수강생의 공간디자인 판단은 `수강생 전문 판단`, 도구 기능·교육 예시 확인은 `강의 전 사실 검증`, 출처·라이선스·배포 범위는 `추가 출처 확인`, 법규·구조·소방·접근성·시공 등은 `법규·구조·소방 등 해당 전문가 판단`으로 구분합니다.

학습 목표와 제출 결과물은 외부 사실이 아니므로 `학습 목표`, `수업 산출물` 교육 구조 분류를 사용합니다. 차시 소개의 확정된 일정·구성은 `확정된 수업 구성`으로 표시합니다. 사실·가정·제안·검증 배지는 핵심 개념, 도구 기능, 전문 정보, 오류 확인처럼 사실성 구분이 필요한 영역에 우선 사용합니다.

## 7. 검증

```bash
npm run typecheck
npm run validate:content
```

`typecheck`는 Zod 스키마와 MDX 타입을 검사합니다. `validate:content`는 강의 파일이 정확히 14개인지, ID 01–14와 day 1–14가 일치하는지, 중복·누락과 필수 metadata가 없는지 검사합니다. 제1차시는 상세 16개 섹션과 강사 메모 슬롯 구조, 제2–14차시는 13개 골격을 검사합니다. 자산 수는 고정하지 않으며 현재 매니페스트에 존재하는 자산의 필수 필드, enum, 공개 조건, 차시 연결을 검사합니다. `reference-only` 자산은 학생용 MDX에 연결되지 않아야 합니다.
