import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const reviewStatus = z.enum([
  '공식 자료 확인',
  '출처 확인',
  '해석',
  '디자인 제안',
  'AI 생성',
  '검증 필요',
  '전문가 검토 필요',
  '업데이트 가능성 높음',
]);

const sharedSchema = z.object({
  title: z.string(),
  day: z.number().int().positive().optional(),
  date: z.string().optional(),
  duration: z.string().optional(),
  lastVerified: z.string().optional(),
  reviewStatus: reviewStatus.default('검증 필요'),
  sources: z.array(z.string()).default([]),
  highRiskContent: z.boolean().default(false),
  requiresProfessionalReview: z.boolean().default(false),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: sharedSchema.extend({
    day: z.number().int().min(1).max(14),
    date: z.string(),
    duration: z.string(),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: sharedSchema,
});

const prompts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/prompts' }),
  schema: sharedSchema,
});

const troubleshooting = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/troubleshooting' }),
  schema: sharedSchema,
});

const updates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/updates' }),
  schema: sharedSchema,
});

export const collections = {
  lessons,
  glossary,
  prompts,
  troubleshooting,
  updates,
};
