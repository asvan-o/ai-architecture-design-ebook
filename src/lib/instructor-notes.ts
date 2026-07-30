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
};

export const getInstructorNoteSlots = (lessonId: string, sectionId: string) =>
  instructorNoteSlotsByLesson[lessonId]?.[sectionId] ?? [];
