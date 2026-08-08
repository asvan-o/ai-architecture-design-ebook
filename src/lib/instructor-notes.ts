export const instructorNoteTypes = [
  'instructor-script',
  'question-cue',
  'demo-warning',
  'fallback',
  'timing',
  'verification',
  'answer-key',
] as const;

export type InstructorNoteType = (typeof instructorNoteTypes)[number];

export interface InstructorNote {
  slot: string;
  type: InstructorNoteType;
  body: string;
}

export const lessonOneInstructorSlots = [
  'l01-opening',
  'l01-generative-ai',
  'l01-ai-human-role',
  'l01-before-gemini-demo',
  'l01-after-gemini-response',
  'l01-response-analysis',
  'l01-fallback-response',
  'l01-student-practice',
  'l01-answer-key',
  'l01-closing',
] as const;

export interface InstructorNoteSlotDefinition {
  slot: string;
  label: string;
}

type LessonSectionNoteMap = Record<string, InstructorNoteSlotDefinition[]>;

export const instructorNoteSlotsByLesson: Record<string, LessonSectionNoteMap> = {
  '01': {
    'section-01': [{ slot: 'l01-opening', label: '도입 메모' }],
    'section-04': [{ slot: 'l01-generative-ai', label: '생성형 AI 설명 메모' }],
    'section-05': [{ slot: 'l01-ai-human-role', label: 'AI와 디자이너 역할 구분 메모' }],
    'section-09': [{ slot: 'l01-before-gemini-demo', label: 'Gemini 시연 전 질문' }],
    'section-10': [
      { slot: 'l01-after-gemini-response', label: 'Gemini 응답 직후 질문' },
      { slot: 'l01-fallback-response', label: '실시간 시연 백업' },
    ],
    'section-11': [{ slot: 'l01-response-analysis', label: '실제 응답 핵심 해설' }],
    'section-13': [{ slot: 'l01-student-practice', label: '실습 시간 운영' }],
    'section-14': [{ slot: 'l01-answer-key', label: '결과물 검토 기준' }],
    'section-16': [{ slot: 'l01-closing', label: '마무리 메모' }],
  },
  '02': {
    'section-01': [
      { slot: 'l02-opening', label: '제1차시 연결과 도입' },
      { slot: 'l02-timing', label: '제2차시 시간 운영' },
    ],
    'section-04': [{ slot: 'l02-first-result-criteria', label: '첫 결과 판단 기준' }],
    'section-07': [{ slot: 'l02-revision-demo', label: '수정 요청문 작업 안내' }],
    'section-08': [
      { slot: 'l02-empty-space-practice', label: '빈 공간 실습 운영' },
      { slot: 'l02-fallback', label: '이미지 생성 실패 대응' },
    ],
    'section-11': [{ slot: 'l02-common-errors', label: '구조·가구 오류 점검' }],
    'section-13': [{ slot: 'l02-next-lesson', label: '제3차시 연결 질문' }],
  },
  '03': {
    'section-01': [
      { slot: 'l03-opening', label: '제2차시 연결과 도입' },
      { slot: 'l03-timing', label: '제3차시 시간 운영' },
    ],
    'section-03': [{ slot: 'l03-evidence-priority', label: '자료 우선순위' }],
    'section-07': [{ slot: 'l03-requirement-matrix', label: '요구조건 매트릭스' }],
    'section-08': [{ slot: 'l03-client-questions', label: '발주기관 추가 질의' }],
    'section-09': [
      { slot: 'l03-gemini-compare', label: 'Gemini와 사람 판단 비교' },
      { slot: 'l03-fallback', label: '문서 분석 실패 대응' },
    ],
    'section-10': [{ slot: 'l03-design-brief', label: '디자인 브리프' }],
    'section-11': [
      { slot: 'l03-image-mismatch', label: '현황 이미지 불일치 점검' },
      { slot: 'l03-next-lesson', label: '제4차시 연결' },
    ],
  },
  '04': {
    'section-01': [
      { slot: 'l04-opening', label: '제3차시 결과 인계' },
      { slot: 'l04-timing', label: '제4차시 시간 운영' },
    ],
    'section-04': [{ slot: 'l04-alternative-difference', label: '공간구성 대안 차이' }],
    'section-05': [{ slot: 'l04-evaluation', label: 'RFP 평가기준' }],
    'section-06': [
      { slot: 'l04-tool-selection', label: '도구·모델 확인' },
      { slot: 'l04-node-install', label: 'Node.js 설치 주의' },
    ],
    'section-08': [
      { slot: 'l04-manager-demo', label: '관리 프로그램 제작 안내' },
      { slot: 'l04-fallback', label: '프로그램 제작 실패 대응' },
    ],
    'section-10': [{ slot: 'l04-local-errors', label: 'localhost·포트 오류 대응' }],
    'section-13': [{ slot: 'l04-final-check', label: '최종 자동화 점검' }],
  },
};

export const getInstructorNoteSlots = (lessonId: string, sectionId: string) =>
  instructorNoteSlotsByLesson[lessonId]?.[sectionId] ?? [];
