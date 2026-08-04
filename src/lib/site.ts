export const siteTitle = 'AI 건축디자인 바이블';

export const withBase = (path = '/') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
};

export const mainNav = [
  { href: '/', label: '홈', marker: '00' },
  { href: '/course-overview/', label: '과정 안내', marker: '01' },
  { href: '/curriculum/', label: '전체 강의 목차', marker: '02' },
  { href: '/glossary/', label: '용어 사전', marker: '03' },
  { href: '/prompts/', label: '프롬프트 라이브러리', marker: '04' },
  { href: '/troubleshooting/', label: '오류 해결 가이드', marker: '05' },
  { href: '/updates/', label: '업데이트 및 정정', marker: '06' },
  { href: '/guide/', label: '전자서적 이용 안내', marker: '07' },
] as const;

export const lessonHref = (id: string) => withBase(`/lessons/${id}/`);

export const pageSections = [
  '학습 목표',
  '필수 용어',
  '오늘 완성할 결과물',
  '핵심 이론',
  '강사 시연',
  '단계별 실습',
  '프롬프트 예시',
  '성공 사례와 실패 사례',
  '사실 검증',
  '주의사항',
  '완료 체크리스트',
  '확인 문제',
  '실습 파일',
] as const;
