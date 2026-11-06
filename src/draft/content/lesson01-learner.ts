// Day 01 presentation only. Original assets, filenames and manifests stay intact.
import {workbookLesson01Text} from '../../../scripts/workbook-lesson01-language.mjs';
export const practices = {
  'DJ-CF-01': {
    label: '실습 A', name: '실습 A · 카페 공간 리뉴얼',
    description: '고객의 요청을 읽고 기존 카페 공간의 조건과 디자인 방향을 정해보는 실습',
    drawingLabels: ['기존 주 출입구(D1)', '기존 창호(W1·W2)', '기존 기둥(C1)', '고객공간(Z1)', '서비스영역(S1)', '기존 카운터(K1)'],
  },
  'DJ-CF-02': {
    label: '실습 B', name: '실습 B · 건물 외관 리뉴얼',
    description: '기존 건물의 형태와 개구부를 유지하면서 입구와 외관의 개선 방향을 정해보는 실습',
    drawingLabels: ['기존 주 출입구(D1)', '기존 창호(W1~W5)', '기존 간판 영역(SZ1)'],
  },
} as const;
export type PracticeId = keyof typeof practices;
export const practice = (id: string) => practices[id as PracticeId];

export const basicPrinciples = [
  'AI 결과를 그대로 믿지 않습니다.',
  '제공한 자료와 다시 비교합니다.',
  '확인되지 않은 것은 확정하지 않습니다.',
  '중요한 판단은 사람이 합니다.',
] as const;

export const answerGroups = [
  ['의뢰서에서 확인됨', '의뢰서나 기준 도면에 실제로 있는 조건', '의뢰서에 기존 출입구를 유지하라고 적혀 있다.'],
  ['AI가 해석함', '자료를 보고 추론한 내용으로, 아직 확정하지 않은 판단', '출입구 주변의 이용이 집중될 수 있다고 해석한다.'],
  ['작업을 위한 임시 가정', '비교 작업을 진행하기 위해 잠시 정한 조건', '두 대안을 비교하기 위해 동일한 이용 상황을 가정한다.'],
  ['새롭게 제안한 내용', '원래 의뢰서에 없는 디자인 선택지', '주요 벽면에 목재 마감을 제안한다.'],
] as const;

// Adapt only labels and terminology; never remove an operational constraint.
export const learnerText = workbookLesson01Text;

export function learnerData<T>(value: T): T {
  if (typeof value === 'string') return learnerText(value) as T;
  if (Array.isArray(value)) return value.map(item => learnerData(item)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, learnerData(item)])) as T;
  return value;
}
