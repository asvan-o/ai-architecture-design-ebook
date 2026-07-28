import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.');
const pendingDate = z.union([isoDate, z.literal('pending')]);

const sourceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  url: z.url().optional(),
  accessedAt: isoDate.optional(),
  sourceType: z.enum([
    'official',
    'documentation',
    'standard',
    'research',
    'reference',
    'other',
  ]),
  note: z.string().trim().min(1).optional(),
});

const sectionSchema = z.object({
  id: z.string().regex(/^section-\d{2}$/),
  label: z.string().trim().min(1),
});

const sharedSchema = z.object({
  title: z.string().trim().min(1),
  draft: z.boolean(),
  contentType: z.enum([
    'pending',
    'factual',
    'interpretation',
    'design-proposal',
    'instruction',
  ]),
  authorship: z.enum(['pending', 'human', 'ai-assisted', 'ai-generated']),
  verificationStatus: z.enum([
    'pending',
    'source-checked',
    'official-source-checked',
    'expert-reviewed',
  ]),
  freshness: z.enum(['pending', 'stable', 'update-sensitive']),
  riskLevel: z.enum(['pending', 'low', 'high']),
  professionalReviewStatus: z.enum(['pending', 'required', 'not-required', 'completed']),
  sources: z.array(sourceSchema),
  lastVerified: z.union([isoDate, z.null()]),
  day: z.number().int().positive().optional(),
  date: pendingDate.optional(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  sections: z.array(sectionSchema).optional(),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: sharedSchema.extend({
    day: z.number().int().min(1).max(14),
    date: pendingDate,
    durationMinutes: z.number().int().positive().nullable(),
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
