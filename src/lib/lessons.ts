import { getCollection } from 'astro:content';

export const getVisibleLessons = async () => {
  const lessons = await getCollection('lessons');

  return lessons.sort((a, b) => a.data.day - b.data.day);
};
