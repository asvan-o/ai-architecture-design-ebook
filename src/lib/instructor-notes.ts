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
