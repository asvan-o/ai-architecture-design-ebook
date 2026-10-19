import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getCourseProfiles, repositoryRoot, courseOutput } from './course-registry.mjs';

const profiles = getCourseProfiles(); // Reject invalid profiles before any build or cleanup.
const portalBase = (process.env.PORTAL_BASE_PATH || process.env.BASE_PATH || '/').replace(/\/+$/, '') || '/';
const run = (argumentsList, env) => {
  const result = spawnSync(process.execPath, argumentsList, { cwd: repositoryRoot, env, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw result.error || new Error(`Build failed (${result.status})`);
};
for (const { course } of profiles) {
  run(['scripts/run-ebook-mode.mjs', 'build', 'student', `--course=${course.courseId}`], { ...process.env, PORTAL_BASE_PATH: portalBase, BUILD_TARGET: 'course' });
}
const portalOutput = path.join(repositoryRoot, 'dist', 'portal', 'student');
run(['node_modules/astro/bin/astro.mjs', 'build', '--mode', 'student', '--outDir', portalOutput], {
  ...process.env, COURSE_ID: 'gwangju-2026', PUBLIC_COURSE_ID: 'gwangju-2026',
  BUILD_TARGET: 'portal', EBOOK_MODE: 'student', PORTAL_BASE_PATH: portalBase,
});
const siteOutput = path.resolve(repositoryRoot, 'dist', 'site');
assert.equal(path.dirname(siteOutput), path.resolve(repositoryRoot, 'dist'));
// Only this generated public aggregate is replaced; isolated instructor builds stay untouched.
await rm(siteOutput, { recursive: true, force: true });
await cp(portalOutput, siteOutput, { recursive: true });
for (const { course } of profiles) {
  await cp(courseOutput(course.courseId, 'student'), path.join(siteOutput, course.routeSlug), { recursive: true });
}
const gwangju = profiles.find(({ course }) => course.courseId === 'gwangju-2026');
await mkdir(path.join(siteOutput, 'downloads'), { recursive: true });
for (const file of gwangju.pdfs.approvedManifest.files) {
  await cp(path.join(courseOutput('gwangju-2026', 'student'), 'downloads', file.fileName), path.join(siteOutput, 'downloads', file.fileName));
}
await cp(path.join(courseOutput('gwangju-2026', 'student'), 'downloads', 'pdf-manifest.json'), path.join(siteOutput, 'downloads', 'pdf-manifest.json'));
await cp(path.join(courseOutput('gwangju-2026', 'student'), 'search-index.json'), path.join(siteOutput, 'search-index.json'));
await rm(portalOutput, { recursive: true, force: true });
for (const { course } of profiles) {
  await rm(courseOutput(course.courseId, 'student'), { recursive: true, force: true });
}
await writeFile(path.join(siteOutput, 'course-builds.json'), `${JSON.stringify({
  schemaVersion: 1, portalBase, courses: profiles.map(({ course }) => ({ courseId: course.courseId, routeSlug: course.routeSlug, contentStatus: course.contentStatus, mode: 'student' })),
}, null, 2)}\n`);
assert((await readFile(path.join(siteOutput, 'robots.txt'), 'utf8')).includes('Disallow: /'));
console.log(`[site] public aggregate: ${siteOutput}; no instructor/presentation outputs published`);
