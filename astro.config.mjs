// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { getCourseProfile, courseOutput } from './scripts/course-registry.mjs';

const profile = getCourseProfile();
const portal = process.env.BUILD_TARGET === 'portal';
const modeIndex = process.argv.indexOf('--mode');
const modeArgument = process.argv.find((argument) => argument.startsWith('--mode='))?.slice('--mode='.length);
const ebookMode = process.env.EBOOK_MODE || modeArgument || (modeIndex >= 0 ? process.argv[modeIndex + 1] : 'student');
const portalBase = (process.env.PORTAL_BASE_PATH || process.env.BASE_PATH || '/').replace(/\/+$/, '');
process.env.PUBLIC_COURSE_ID = profile.course.courseId;

export default defineConfig({
  integrations: [react(), mdx()],
  output: 'static',
  outDir: portal ? './dist/portal/student' : courseOutput(profile.course.courseId, ebookMode),
  srcDir: portal ? './src/portal' : profile.course.contentStatus === 'design-pending' ? './src/draft' : './src',
  publicDir: !portal && profile.course.contentStatus === 'design-pending' ? './src/draft/public' : './public',
  cacheDir: `./node_modules/.astro/${portal ? 'portal' : profile.course.courseId}/${ebookMode}`,
  site: process.env.SITE_URL,
  base: portal ? portalBase || '/' : `${portalBase}/${profile.course.routeSlug}`,
  trailingSlash: 'always',
});
