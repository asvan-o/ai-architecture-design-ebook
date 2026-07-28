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
  pending | source-checked | official-source-checked | expert-reviewed

freshness:
  pending | stable | update-sensitive

riskLevel:
  pending | low | high

professionalReviewStatus:
  pending | required | not-required | completed
```

서로 다른 의미를 한 필드에 섞지 않으며 한 콘텐츠에 여러 배지를 동시에 표시합니다. `riskLevel: pending`은 “검토 대기”로 표시합니다. `professionalReviewStatus`가 `required` 또는 `completed`일 때만 해당 확정 배지를 표시합니다.

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

현재 placeholder 파일은 전체 골격을 확인하기 위해 `LessonPlaceholder.astro`를 사용합니다. 승인된 문서가 들어오면 해당 MDX에서 필요한 개별 컴포넌트만 import하여 조합할 수 있으며, 스키마는 13개 섹션을 모두 요구하지 않습니다.

## 7. 검증

```bash
npm run typecheck
npm run validate:content
```

`typecheck`는 Zod 스키마와 MDX 타입을 검사합니다. `validate:content`는 강의 파일이 정확히 14개인지, ID 01–14와 day 1–14가 일치하는지, 중복·누락과 필수 metadata가 없는지 검사하고 실패 시 종료 코드 1을 반환합니다.
