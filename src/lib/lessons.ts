import { getCollection } from 'astro:content';
import { activeCourse, isCourseDraft } from './courses';
import { getLessonRoadmapItem } from './lesson-topics';
import {
  isInstructorBuild,
  isPdfReviewBuild,
  isReleasedStudentLesson,
} from './student-release';

export const getVisibleLessons = async () => {
  if (isCourseDraft) return [];
  const lessons = await getCollection('lessons');
  const selectedIds = new Set((activeCourse.lessons as { id: string }[]).map((lesson) => lesson.id));

  const titledLessons = lessons.map((lesson) => {
    const roadmapLesson = getLessonRoadmapItem(lesson.id);
    if (!roadmapLesson || roadmapLesson.title === lesson.data.title) return lesson;

    return {
      ...lesson,
      data: {
        ...lesson.data,
        title: roadmapLesson.title,
      },
    };
  });

  return titledLessons
    .filter((lesson) => selectedIds.has(lesson.id))
    .filter((lesson) =>
      isInstructorBuild || isPdfReviewBuild || isReleasedStudentLesson(lesson.id))
    .sort((a, b) => a.data.day - b.data.day);
};
