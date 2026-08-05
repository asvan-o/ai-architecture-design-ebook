import studentRelease from '../../data/student-release.json';

const normalizeLessonId = (lessonId: string | number) =>
  String(lessonId).padStart(2, '0');

export const releasedStudentLessonIds = Object.freeze(
  studentRelease.releasedStudentLessonIds.map(normalizeLessonId),
);
export const releasedPdfLessonIds = Object.freeze(
  studentRelease.releasedPdfLessonIds.map(normalizeLessonId),
);

const releasedStudentLessonIdSet = new Set(releasedStudentLessonIds);
const releasedPdfLessonIdSet = new Set(releasedPdfLessonIds);

export const isInstructorBuild = import.meta.env.MODE === 'instructor';
export const isPdfReviewBuild = import.meta.env.MODE === 'pdf-review';
export const isStudentBuild = !isInstructorBuild && !isPdfReviewBuild;

export const isReleasedStudentLesson = (lessonId: string | number) =>
  releasedStudentLessonIdSet.has(normalizeLessonId(lessonId));

export const isReleasedStudentPdf = (lessonId: string | number) =>
  releasedPdfLessonIdSet.has(normalizeLessonId(lessonId));

export const hasUnreleasedStudentLessons = releasedStudentLessonIds.length < 14;

export const lastReleasedStudentLessonId =
  releasedStudentLessonIds.at(-1) ?? null;
