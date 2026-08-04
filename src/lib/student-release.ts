import studentRelease from '../../data/student-release.json';

const normalizeLessonId = (lessonId: string | number) =>
  String(lessonId).padStart(2, '0');

export const releasedStudentLessonIds = Object.freeze(
  studentRelease.releasedStudentLessonIds.map(normalizeLessonId),
);

const releasedStudentLessonIdSet = new Set(releasedStudentLessonIds);

export const isInstructorBuild = import.meta.env.MODE === 'instructor';
export const isStudentBuild = !isInstructorBuild;

export const isReleasedStudentLesson = (lessonId: string | number) =>
  releasedStudentLessonIdSet.has(normalizeLessonId(lessonId));

export const hasUnreleasedStudentLessons = releasedStudentLessonIds.length < 14;

export const lastReleasedStudentLessonId =
  releasedStudentLessonIds.at(-1) ?? null;
