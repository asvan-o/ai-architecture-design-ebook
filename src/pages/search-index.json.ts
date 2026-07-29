import type { APIRoute } from 'astro';
import { mainNav, withBase } from '../lib/site';
import { getVisibleLessons } from '../lib/lessons';

export const GET: APIRoute = async () => {
  const lessons = await getVisibleLessons();

  const pages = mainNav.map((item) => ({
    title: item.label,
    href: withBase(item.href),
    type: 'PAGE',
    summary: item.href === '/' ? '전자서적 홈' : `${item.label} 페이지`,
  }));

  const lessonItems = lessons.map((lesson) => ({
    title: lesson.data.title,
    href: withBase(`/lessons/${lesson.id}/`),
    type: `LESSON ${String(lesson.data.day).padStart(2, '0')}`,
    summary: `${
      lesson.data.date === 'pending' ? '일정 확인 예정' : lesson.data.date
    } · ${
      lesson.data.durationMinutes === null ? '수업시간 확인 예정' : `${lesson.data.durationMinutes}분`
    }`,
  }));

  return new Response(JSON.stringify([...pages, ...lessonItems]), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
