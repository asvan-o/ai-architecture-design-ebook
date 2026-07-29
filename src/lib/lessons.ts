import { getCollection } from 'astro:content';

export const getVisibleLessons = async () => {
  const lessons = await getCollection('lessons', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );

  return lessons.sort((a, b) => a.data.day - b.data.day);
};
