import { getCollection } from 'astro:content';
import { getLessonRoadmapItem } from './lesson-topics';
import { isInstructorBuild, isReleasedStudentLesson } from './student-release';

export const getVisibleLessons = async () => {
  const lessons = await getCollection('lessons');

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
    .filter((lesson) => isInstructorBuild || isReleasedStudentLesson(lesson.id))
    .sort((a, b) => a.data.day - b.data.day);
};
