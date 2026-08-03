# 제3자 패키지 안내

이 프로그램은 로컬 HTTP 서버에 Express 5.x를 사용합니다.

- Express: MIT License
- Express의 전이 의존성: 정확한 패키지명, 버전과 `license` 값은
  `package-lock.json`에 기록되어 있습니다.

READY ZIP은 `node_modules`를 포함하지 않습니다. 사용자는 `npm ci`를 실행해
npm registry에서 잠금 파일에 기록된 패키지를 설치합니다. 외부 배포나 상업적
재배포 전에는 각 패키지의 원문 라이선스와 고지 의무를 다시 확인해야 합니다.
