import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { mainNav, withBase } from '../lib/site';

export const GET: APIRoute = async () => {
  const lessons = (await getCollection('lessons')).sort((a, b) => a.data.day - b.data.day);

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
    summary: `${lesson.data.date} · ${lesson.data.duration}`,
  }));

  return new Response(JSON.stringify([...pages, ...lessonItems]), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
