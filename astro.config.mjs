// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { getCourseProfile } from './scripts/course-registry.mjs';

const profile = getCourseProfile();
const portal = process.env.BUILD_TARGET === 'portal';
const portalBase = (process.env.PORTAL_BASE_PATH || process.env.BASE_PATH || '/').replace(/\/+$/, '');
process.env.PUBLIC_COURSE_ID = profile.course.courseId;

export default defineConfig({
  integrations: [react(), mdx()],
  output: 'static',
  srcDir: portal ? './src/portal' : profile.course.contentStatus === 'design-pending' ? './src/draft' : './src',
  cacheDir: `./node_modules/.astro/${portal ? 'portal' : profile.course.courseId}/${process.env.EBOOK_MODE || 'student'}`,
  site: process.env.SITE_URL,
  base: portal ? portalBase || '/' : `${portalBase}/${profile.course.routeSlug}`,
  trailingSlash: 'always',
});
