import profile from '../../../data/courses/daejeon-2026/course.json';

const lessons=profile.reviewDraft.lessons;
const teachingMinutes=lessons.reduce((sum,lesson)=>sum+lesson.durationMinutes,0);
export const courseTiming={
  lessonCount:lessons.length,
  teachingMinutes,
  periodMinutes:50,
  periodCount:teachingMinutes/50,
  operatingHours:teachingMinutes/50,
} as const;
