export type StatusKind =
  | 'contentType'
  | 'authorship'
  | 'verificationStatus'
  | 'freshness'
  | 'riskLevel'
  | 'professionalReviewStatus';

type StatusMeta = {
  label: string;
  tone: string;
};

export const statusCatalog: Record<StatusKind, Record<string, StatusMeta>> = {
  contentType: {
    pending: { label: '콘텐츠 유형 · 검토 대기', tone: 'check' },
    factual: { label: '사실 정보', tone: 'source' },
    interpretation: { label: '해석', tone: 'interpretation' },
    'design-proposal': { label: '디자인 제안', tone: 'design' },
    instruction: { label: '학습 안내', tone: 'instruction' },
  },
  authorship: {
    pending: { label: '작성 방식 · 검토 대기', tone: 'check' },
    human: { label: '사람 작성', tone: 'source' },
    'ai-assisted': { label: 'AI 보조', tone: 'ai' },
    'ai-generated': { label: 'AI 생성', tone: 'ai' },
  },
  verificationStatus: {
    pending: { label: '검증 필요', tone: 'check' },
    'source-checked': { label: '출처 확인', tone: 'source' },
    'official-source-checked': { label: '공식 자료 확인', tone: 'verified' },
    'expert-reviewed': { label: '전문가 검토 완료', tone: 'verified' },
  },
  freshness: {
    pending: { label: '최신성 · 검토 대기', tone: 'check' },
    stable: { label: '최신성 안정', tone: 'source' },
    'update-sensitive': { label: '업데이트 가능성 높음', tone: 'changing' },
  },
  riskLevel: {
    pending: { label: '위험도 · 검토 대기', tone: 'check' },
    low: { label: '위험도 낮음', tone: 'source' },
    high: { label: '고위험 콘텐츠', tone: 'expert' },
  },
  professionalReviewStatus: {
    pending: { label: '전문가 검토 · 검토 대기', tone: 'check' },
    required: { label: '일부 항목 · 전문 검토 필요', tone: 'expert' },
    'not-required': { label: '전문가 검토 불필요', tone: 'source' },
    completed: { label: '전문가 검토 완료', tone: 'verified' },
  },
};

export const getStatusMeta = (kind: StatusKind, value: string): StatusMeta =>
  statusCatalog[kind][value] ?? { label: value, tone: 'check' };
