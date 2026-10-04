import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { baselineCommit, getCourseProfiles, getCourseProfile, validateCourseProfiles, repositoryRoot, courseOutput } from './course-registry.mjs';

const profiles = getCourseProfiles();
const lock = JSON.parse(readFileSync(path.join(repositoryRoot, 'data/courses/gwangju-2026/baseline-lock.json'), 'utf8'));
assert.equal(lock.baselineCommit, baselineCommit);
const hashes = execFileSync('git', ['hash-object', '--', ...lock.files.map((file) => file.path)], { cwd: repositoryRoot, encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/);
for (const [index, file] of lock.files.entries()) {
  const hash = hashes[index];
  assert.equal(hash, file.blobId, `Approved Gwangju content changed: ${file.path}`);
}
assert.throws(() => getCourseProfile('unknown-course'), /Unknown courseId/);
assert.throws(() => validateCourseProfiles([profiles[0], profiles[0]]), /Duplicate courseId/);
const duplicateRoute = structuredClone(profiles);
duplicateRoute[1].course.routeSlug = duplicateRoute[0].course.routeSlug;
assert.throws(() => validateCourseProfiles(duplicateRoute), /Duplicate course route/);
const outputs = profiles.flatMap(({ course }) => ['student', 'instructor', 'pdf-review'].map((mode) => courseOutput(course.courseId, mode)));
assert.equal(new Set(outputs).size, outputs.length);
const gwangju = getCourseProfile('gwangju-2026');
assert.equal(gwangju.course.lessons.length, 14);
assert.equal(gwangju.course.totalMinutes, 2880);
assert.equal(getCourseProfile('daejeon-2026').course.lessons.length, 0);
console.log(`[courses] ${profiles.length} profiles; IDs/routes/output isolation; invalid ID rejected; ${lock.files.length} approved files unchanged`);
