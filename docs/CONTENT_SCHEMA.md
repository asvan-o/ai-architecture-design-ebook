# 콘텐츠 스키마

## 1. 기본 원칙

실제 콘텐츠는 UI 코드와 분리하여 `src/content/` 아래 MDX 파일로 관리합니다. 승인되지 않은 전문정보, 사실, 출처는 작성하지 않습니다. 아직 자료가 없으면 짧은 placeholder 또는 빈 본문을 유지합니다.

## 2. 컬렉션

| 컬렉션 | 폴더 | 용도 |
| --- | --- | --- |
| `lessons` | `src/content/lessons/` | 14개 강의 본문 |
| `glossary` | `src/content/glossary/` | 용어 정의 |
| `prompts` | `src/content/prompts/` | 승인된 프롬프트 |
| `troubleshooting` | `src/content/troubleshooting/` | 오류 해결 항목 |
| `updates` | `src/content/updates/` | 업데이트와 정정 기록 |

## 3. 공통 frontmatter

```yaml
---
title: "제1차시 · 내용 검토 예정"
day: 1
date: "일정 확인 예정"
duration: "수업시간 확인 예정"
lastVerified: "검토 전"
reviewStatus: "검증 필요"
sources: []
highRiskContent: false
requiresProfessionalReview: false
---
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | string | 페이지 제목 |
| `day` | number | 차시 번호. 강의에서는 1–14 필수, 다른 컬렉션에서는 선택 |
| `date` | string | 수업일 또는 문서 기준일 |
| `duration` | string | 수업시간 |
| `lastVerified` | string | 마지막 사실 검증일 또는 검토 상태 |
| `reviewStatus` | enum | 사실성 상태 배지 |
| `sources` | string[] | 승인된 출처 식별자 또는 URL. 현재는 빈 배열 |
| `highRiskContent` | boolean | 고위험 전문정보 포함 여부 |
| `requiresProfessionalReview` | boolean | 전문가 검토 필요 여부 |

스키마는 `src/content.config.ts`에서 검증합니다.

## 4. reviewStatus 값

- `공식 자료 확인`
- `출처 확인`
- `해석`
- `디자인 제안`
- `AI 생성`
- `검증 필요`
- `전문가 검토 필요`
- `업데이트 가능성 높음`

## 5. 강의 문서의 권장 섹션

승인된 문서가 제공되면 아래 순서를 기본으로 사용합니다.

1. 학습 목표
2. 필수 용어
3. 오늘 완성할 결과물
4. 핵심 이론
5. 강사 시연
6. 단계별 실습
7. 프롬프트 예시
8. 성공 사례와 실패 사례
9. 사실 검증
10. 주의사항
11. 완료 체크리스트
12. 확인 문제
13. 실습 파일

현재 강의 MDX 파일은 frontmatter와 “승인된 강의 본문 삽입 예정” 주석만 포함합니다. 화면의 섹션 placeholder는 UI 골격 확인을 위한 것으로 전문 내용이 아닙니다.

## 6. 출처 규칙

- 출처를 추정하거나 URL을 만들어내지 않습니다.
- 실제 주장과 연결되는 승인된 출처만 기록합니다.
- 날짜에 민감한 정보는 `lastVerified`와 `업데이트 가능성 높음` 상태를 함께 검토합니다.
- 안전, 법규, 구조, 계약 등 고위험 내용은 `highRiskContent`와 `requiresProfessionalReview`를 명시적으로 검토합니다.
