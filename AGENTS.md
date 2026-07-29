# AGENTS.md

이 저장소에서 작업하는 모든 에이전트와 기여자는 아래 원칙을 지킨다.

## 콘텐츠 보호 원칙

- 실제 강의 내용을 임의로 생성하거나 변경하지 않는다.
- `source/` 폴더는 원칙적으로 과거 참고자료다. 단, 사용자가 명시적으로 승인한
  `source/approved-curriculum.md`는 14차시 제목·시간·범위의 기준 문서로 사용한다.
- `docs/`와 `src/content/`의 승인된 문서를 현재 기준으로 사용한다.
- 사실과 출처를 추정하거나 만들어내지 않는다.
- 출처가 없는 전문정보는 placeholder로 둔다.
- 강의 본문을 수정할 때는 사용자의 명시적인 요청이 필요하다.
- UI 코드와 콘텐츠를 분리한다.

## 개발 원칙

- 새 의존성은 반드시 필요한 경우에만 추가한다.
- 인터랙션이 필요한 작은 영역에만 React를 사용한다.
- 기본 CSS 또는 CSS Modules를 사용하고 불필요한 UI 프레임워크를 추가하지 않는다.
- 키보드 접근성, 명확한 포커스, 반응형 레이아웃을 유지한다.
- GitHub Pages의 하위 경로 배포를 고려해 내부 링크에 `BASE_PATH`를 반영한다.

## 개발 서버

개발 서버를 시작할 때는 background mode를 사용한다.

```bash
astro dev --background
```

다음 명령으로 관리한다.

```bash
astro dev status
astro dev logs
astro dev stop
```

## 완료 전 검증

변경 후 반드시 다음 검사를 실행한다.

```bash
npm run lint
npm run typecheck
npm run build
```

완료 후 수정 파일과 각 검증 결과를 사용자에게 보고한다.

## 관련 문서

- `docs/DEVELOPMENT_GUIDE.md`
- `docs/CONTENT_SCHEMA.md`
- `docs/DESIGN_SYSTEM.md`
- Astro 공식 문서: https://docs.astro.build
