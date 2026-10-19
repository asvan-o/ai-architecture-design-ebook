// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import {lesson07PreviewBoundary} from './scripts/lesson07-preview-boundary.mjs';
import { getCourseProfile, courseOutput } from './scripts/course-registry.mjs';

const localDev = process.argv.includes('dev');
const profile = getCourseProfile(process.env.COURSE_ID || (localDev ? 'daejeon-2026' : undefined));
const portal = process.env.BUILD_TARGET === 'portal';
const modeIndex = process.argv.indexOf('--mode');
const modeArgument = process.argv.find((argument) => argument.startsWith('--mode='))?.slice('--mode='.length);
const ebookMode = process.env.EBOOK_MODE || modeArgument || (modeIndex >= 0 ? process.argv[modeIndex + 1] : 'student');
const portalBase = (process.env.PORTAL_BASE_PATH || process.env.BASE_PATH || '/').replace(/\/+$/, '');
process.env.PUBLIC_COURSE_ID = profile.course.courseId;
const localDaejeon = localDev && !portal && profile.course.courseId === 'daejeon-2026';
if (localDaejeon) process.env.PUBLIC_DAEJEON_REVIEW_ASSETS = 'true';
const { daejeonLocalAssetsPlugin } = localDaejeon ? await import('./scripts/daejeon-local-assets-plugin.mjs') : {};

export default defineConfig({
  integrations: [react(), mdx(), lesson07PreviewBoundary()],
  vite: { plugins: localDaejeon && daejeonLocalAssetsPlugin ? [daejeonLocalAssetsPlugin(`${portalBase}/${profile.course.routeSlug}`)] : [] },
  output: 'static',
  outDir: portal ? './dist/portal/student' : courseOutput(profile.course.courseId, ebookMode),
  srcDir: portal ? './src/portal' : profile.course.contentStatus === 'design-pending' ? './src/draft' : './src',
  publicDir: !portal && profile.course.contentStatus === 'design-pending' ? './src/draft/public' : './public',
  cacheDir: `./node_modules/.astro/${portal ? 'portal' : profile.course.courseId}/${ebookMode}`,
  site: process.env.SITE_URL,
  base: portal ? portalBase || '/' : `${portalBase}/${profile.course.routeSlug}`,
  trailingSlash: 'always',
});
